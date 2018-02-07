<template>
  <div class="stock" ref="stock">
    <div class="main" :class="{ mainWithSetMode: setModeChecked }">
      <!-- <h1>{{lodingMsg}}</h1> -->
      <div class="header-line">
        <el-table
          align="center"
          header-align="center"
          size="mini"
          :data="sortStocks"
          style="width: 100%"
          :cell-class-name = 'cellClassName'
          ref="stockTable"
          >
          <el-table-column
            label="股票">
            <template slot-scope="scope">
              <a class="stock-link" :href="`http://stockpage.10jqka.com.cn/${scope.row.code.slice(2)}/`" target="_blank">{{scope.row.name}}<span class='stock-code'>{{scope.row.code}}</span></a>
            </template>
          </el-table-column>

          <!-- <el-table-column
            prop="code"
            label="代码">
          </el-table-column> -->

          <el-table-column
            v-if="colList.indexOf('curPrice') != -1"
            prop="curPrice"
            label="现价"
            :formatter="formatterFixedTwo"
            width="50"
            :sortable="!setModeChecked">
          </el-table-column>
            
          <el-table-column
            v-if="colList.indexOf('range') != -1"
            label="涨跌幅"
            prop="range"
            width="70"
            :formatter="formatter"
            :sortable="!setModeChecked">
          </el-table-column>        
          
          <el-table-column
            v-if="colList.indexOf('rangePrice') != -1"
            prop="rangePrice"
            label="涨跌额"
            width="70"
            :formatter="formatterFixedTwo"      
            :sortable="!setModeChecked">
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('toPrice') != -1"
            prop="toPrice"
            label="今开"
            :formatter="formatterFixedTwo"
            width="40">
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('highPrice') != -1"
            prop="highPrice"
            label="最高"
            :formatter="formatterFixedTwo"
            width="40">
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('lowPrice') != -1"
            prop="lowPrice"
            label="最低"
            :formatter="formatterFixedTwo"
            width="40">
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('profit') != -1"
            prop="profit"
            label="盈亏"
            width="50"
            :sortable="!setModeChecked">
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('cost') != -1"
            label="成本"
            width="45">
            <template slot-scope="scope">
              <el-input v-show="scope.row.edit" v-model="localStock[scope.$index].cost" size="mini"></el-input>
              <span v-show="!scope.row.edit">{{ scope.row.cost }}</span>
            </template>
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('count') != -1"
            label="持仓"
            width="45">
            <template slot-scope="scope">
              <el-input v-show="scope.row.edit" v-model="localStock[scope.$index].count" size="mini"></el-input>
              <span v-show="!scope.row.edit">{{ scope.row.count }}</span>
            </template>
          </el-table-column>
        
          <el-table-column
            label="走势图"
            width="100"
            v-if="colList.indexOf('chart') != -1"
            >
            <template slot-scope="props">
              <peity v-if="props.row.lineData.length" :type="setPeity.type" :options="setPeity.options" :data="props.row.lineData"></peity>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="145"
            v-if="setModeChecked"
            >
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="moveUp(scope.$index)"
                :disabled="scope.$index == 0"
                type="text"
                size="mini">
                上移
              </el-button>
              <el-button
                @click.native.prevent="moveDown(scope.$index)"
                :disabled="scope.$index+1 == localStockLength"
                type="text"
                size="mini">
                下移
              </el-button>
              <el-button
                @click.native.prevent="edit(scope.$index)"
                type="text"
                size="mini">
                {{ scope.row.edit ? "完成" : "编辑" }}
              </el-button>
              <el-button
                @click.native.prevent="deleteRow(scope.$index, scope.row)"
                type="text"
                size="mini">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="footer" :class="{ footerWithSetMode: setModeChecked }">
      <div class="input" v-if="setModeChecked">
        <el-form 
          :inline="true" 
          ref="formInline" 
          :model="formInline" 
          class="demo-form-inline" 
          size="mini" 
          :rules="rules">
          <el-form-item label="股票代码" prop="code">
            <el-autocomplete
              v-model="formInline.code" 
              :fetch-suggestions="querySearch"
              :trigger-on-focus="false"
              @select="handleSelect"
              placeholder="请输入股票代码或股票名"
              clearable>
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="成本价">
            <el-input 
              v-model="formInline.cost" 
              placeholder="请输入持仓成本"
              clearable>
            </el-input>
          </el-form-item>
          <br>
          <el-form-item label="持股量">
            <el-input 
              v-model="formInline.count" 
              placeholder="请输入持股量"
              clearable>
            </el-input>
          </el-form-item>                
          <el-form-item>
            <el-button type="primary" @click="addStock('formInline')">添加</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="setModeChecked">
        <template>
          <el-checkbox-group v-model="colList" :min="1">
            <el-checkbox label="curPrice">最新价</el-checkbox>
            <el-checkbox label="range">涨跌幅</el-checkbox>
            <el-checkbox label="rangePrice">涨跌额</el-checkbox>
            <el-checkbox label="profit">盈亏</el-checkbox>
            <el-checkbox label="toPrice">今开</el-checkbox>
            <el-checkbox label="highPrice">最高</el-checkbox>
            <el-checkbox label="lowPrice">最低</el-checkbox>
            <el-checkbox label="cost">成本</el-checkbox>
            <el-checkbox label="count">持仓</el-checkbox>
            <el-checkbox label="chart">走势图</el-checkbox>
          </el-checkbox-group>
        </template>
      </div>
      <div class="progress-wrapper">
        <el-progress type="circle" :stroke-width="3" :width="20" :percentage="progress" :show-text="false"></el-progress>
      </div>
      <div class="announcement-wrapper" :style="{ width: announcementWidth + 'px' }">
        <ScrollMsgLine :data="announcements"></ScrollMsgLine>
      </div>
      <div class="set-mode-checked-wrapper">
        <el-switch
          v-model="setModeChecked"
          active-text="设置">
        </el-switch>
      </div>
    </div>
  </div>    
</template>
<script>
import Peity from '../components/Peity.vue';
import ScrollMsgLine from '../components/ScrollMsgLine.vue';
import { 
  getStockByCode, 
  getStockBySuggest, 
  getStockTrade, 
  getAnnouncement 
} from './api/api';
import {
  check,
  getRightShock,
  getColWidth,
  getFixedNum,
  MIN_STOCKWIDTH_WITH_SET
} from './api/base';
import {
  getSuggestList,
  getStockDetail,
  getStockTradeDetail,
  getAnnouncementDetail
} from './api/former';
export default {
  data() {
    var checkStock = (rule, value, callback) => {
      console.log(this.formInline.code);
      setTimeout(() => {
        if (!check(this.formInline.code.slice(-6))) {
          callback(new Error('请输入正确的股票代码'));
        } else {
          callback();
        }
      }, 500);
    };
    var checkRepeat = (rule, value, callback) => {
      if (this.localStock.indexOfAtt(value.slice(-8), 'code') > -1) {
        callback(new Error('股票已存在，请勿重复添加！'));
      } else {
        callback();
      }
    };
    return {
      setPeity: {
        type: 'line',
        options: {
          stroke: '#3ca316',
          width: 60,
          height: 20
        }
      },
      lodingMsg: 'loading...',
      stocks: [],
      suggests: [],
      localStock: [],
      stockList: [],
      formInline: {
        code: '',
        cost: '',
        count: '',
        downLimit:'',
        upLimit:''
      },
      setModeChecked: false,
      colList: [],
      stockWidth: 0,
      progress: 0,
      announcements: new Array(),
      rules: {
        code: [
          { required: true, message: '请输入股票名称或代码', trigger: 'blur' },
          { validator: checkStock, trigger: 'blur' },
          { validator: checkRepeat, trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this._initGetStock();
    this._getAnnouncement();
  },
  mounted() {
    setInterval(() => {
      this._getALLStock(this.localStock);
    }, 10000);
    setInterval(() => {
      this._progressIncrease();
    }, 100);
    setTimeout(() => {
      this._getALLStockTrade(this.localStock);
    }, 300)
  },
  watch: {
    stocks: function() {
      // console.log('watch stocks', this.stocks);
    },
    localStock: {
      handler: function() {
        localStorage.localStock = JSON.stringify(this.localStock);
      },
      deep: true
    },
    stockWidth: function(val) {
      this.$refs.stock.style.width = val.toString() + 'px';
    },
    colList: function() {
      localStorage.colList = JSON.stringify(this.colList);
      if (this.colList.indexOf('chart') < 0) {
        this.data = '1,1,1,1';
      }
      this._setStockWidth();
    },
    setModeChecked: function(val) {
      this._setStockWidth();
      if (val) {
        this.$refs.stockTable.clearSort();
      }
    }
  },
  computed: {
    sortStocks() {
      var stocksTemp = this.stocks;
      var that = this;
      return stocksTemp.sort(function(a, b) {
        return (
          that.localStock.indexOfAtt(a.code, 'code') -
          that.localStock.indexOfAtt(b.code, 'code')
        );
      });
    },
    localStockLength() {
      return this.localStock.length;
    },
    announcementWidth() {
      return this.stockWidth - 112;
    }
  },
  methods: {
    lineData(index, row) {
      return this.data.indexOfAtt('code', row.peity).toString();
    },
    querySearch(queryString, cb) {
      getStockBySuggest(queryString).then(res => {
        var suggestList = getSuggestList(res);
        var result = queryString
          ? suggestList.filter(this.createFilter(queryString))
          : suggestList;
        cb(result);
      });
    },
    createFilter(queryString) {
      return restaurant => {
        // return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        return check(restaurant.value.slice(-6));
      };
    },
    handleSelect(item) {
      this.formInline.code = item.value;
    },
    cellClassName(rows, columns, rowIndex, columnIndex) {
      if (rows.column.label == '涨跌幅' || rows.column.label == '涨跌额') {
        return rows.row.rangePrice >= 0 ? 'stock-up' : 'stock-down';
      }
    },
    formatter(row, column) {
      return row.range.toFixed(2) + '%';
    },
    formatterFixedTwo(row, column) {
       return (row[column['property']]).toFixed(2)
    },
    moveUp(index) {
      this.localStock.splice(
        this.localStock.indexOfAtt(this.stocks[index - 1].code, 'code'),
        0,
        this.localStock.splice(
          this.localStock.indexOfAtt(this.stocks[index].code, 'code'),
          1
        )[0]
      );
    },
    moveDown(index) {
      this.localStock.splice(
        this.localStock.indexOfAtt(this.stocks[index + 1].code, 'code'),
        0,
        this.localStock.splice(
          this.localStock.indexOfAtt(this.stocks[index].code, 'code'),
          1
        )[0]
      );
    },
    edit(index) {
      let that = this;
      if(this.stocks[index].edit) {
        this.$set(this.stocks[index], 'edit', false);
        this.stocks[index].cost = this.localStock[index].cost;
        this.stocks[index].count = this.localStock[index].count;
        this.stocks[index].profit = this.stocks[index].curPrice == 0 ? 0 : (this.stocks[index].cost == 0 ? 0 : getFixedNum((this.stocks[index].curPrice - this.stocks[index].cost) * this.stocks[index].count, 3));
      } else {
        this.$set(this.stocks[index], 'edit', true);
        if(this.colList.indexOf('cost') == -1) this.colList.push('cost');
        if(this.colList.indexOf('count') == -1) this.colList.push('count');
        this.stocks.forEach(function (val, idx) {
          if(index != idx && val.edit == true) {
            that.$set(that.stocks[idx], 'edit', false);
            that.stocks[idx].cost = that.localStock[idx].cost;
            that.stocks[idx].count = that.localStock[idx].count;
            that.stocks[idx].profit = that.stocks[idx].curPrice == 0 ? 0 : (that.stocks[idx].cost == 0 ? 0 : getFixedNum((that.stocks[idx].curPrice - that.stocks[idx].cost) * that.stocks[idx].count, 3));
          }
        });
      }
    },
    deleteRow(index, rows) {
      var that = rows;
      this.localStock.splice(this.localStock.indexOfAtt(that.code, 'code'), 1);
      this.stocks.remove(that);
    },
    addStock(formName) {
      let code = this.formInline.code.slice(-8);
      let cost = this.formInline.cost || 0;
      let count = this.formInline.count || 0;
      let upLimit = this.formInline.upLimit || 0;
      let downLimit = this.formInline.downLimit || 0;
      this.$refs[formName].validate(valid => {
        if (valid) {
          this._getStockByCode(code, cost, count, upLimit, downLimit);
          this._getStockTrade(code);
        } else {
          return;
        }
      });
    },
    _getALLStockTrade(allStock) {
      for (let i = 0; i < allStock.length; i++) {
        var that = this;
        setTimeout(() => {
          this._getStockTrade(allStock[i].code);
        }, 30);
      }
    },
    _initGetStock() {
      const conShock = [{ cost: 0, code: 'sz002183', count: '0', downLimit: 0, upLimit: 0 }];
      const colList = ['curPrice', 'range', 'rangePrice', 'profit', 'chart'];

      this.colList =
        localStorage.colList && JSON.parse(localStorage.colList).length > 0
          ? JSON.parse(localStorage.colList)
          : colList;
      this.localStock =
        localStorage.localStock &&
        JSON.parse(localStorage.localStock).length > 0
          ? JSON.parse(localStorage.localStock)
          : conShock;
      this._getALLStock(this.localStock);
    },
    _getALLStock(allStock) {
      for (let i = 0; i < allStock.length; i++) {
        var that = this;
        setTimeout(() => {
          this._getStockByCode(
            allStock[i].code,
            allStock[i].cost,
            allStock[i].count,
            allStock[i].upLimit,
            allStock[i].downLimit
          );
        }, 30);
      }
    },
    _getStockTrade(code) {
      getStockTrade(code).then(res => {
        this.data = getStockTradeDetail(res).toString();
        var idxOfStocks = this.stocks.indexOfAtt(code, 'code');
        var stocks = this.stocks;
        if (idxOfStocks >= 0) {
          stocks[idxOfStocks]['lineData'] = this.data.toString();
          this.stocks.splice(idxOfStocks, 1, stocks[idxOfStocks]);
        } else {
          console.log(code);
          this.stocks.push({ code: code, lineData: this.data.toString()});
        }
      });
    },
    _getStockByCode(code, cost, count, upLimit, downLimit) {
      getStockByCode(code).then(res => {
        var stockObj = getStockDetail(res, code, cost, count);

        if (stockObj) {
          var idxOfStocks = this.stocks.indexOfAtt(code, 'code');
          //   stockObj['lineData'] = stockObj['lineData'] ? stockObj['lineData'] : []

          var idxOfLocalStock = this.localStock.indexOfAtt(code, 'code');
          // 编辑状态标记
          if(idxOfStocks > 0) {
            stockObj['edit'] = this.stocks[idxOfStocks]['edit'] ? this.stocks[idxOfStocks]['edit'] : false;
          }
          // 更新this.stocks
          if (idxOfStocks >= 0) {
            // 已存在，不更新lineData
            stockObj['lineData'] = this.stocks[idxOfStocks]['lineData'] ? this.stocks[idxOfStocks]['lineData']  : []
            this.stocks.splice(idxOfStocks, 1, stockObj)
          } else {
            stockObj['lineData'] = []
            this.stocks.push(stockObj);
          }
          
          if(idxOfLocalStock < 0) {
            this.localStock.push({ code, cost, count, upLimit, downLimit }) 
            this.formInline.code = ''
            this.formInline.cost = ''
            this.formInline.count = ''
          }
        }
      });
    },
    _getAnnouncement(limit=20) {
      getAnnouncement(limit).then(res => {
        this.announcements = getAnnouncementDetail(res);
        console.log(this.announcements);
      });
    },
    _setStockWidth() {
      var stockWidthTemp = this.setModeChecked
        ? getColWidth('init') + getColWidth('set')
        : getColWidth('init');
      this.colList.forEach(function(val, idx) {
        stockWidthTemp += getColWidth(val);
      });
      this.stockWidth =
        stockWidthTemp < MIN_STOCKWIDTH_WITH_SET && this.setModeChecked
          ? MIN_STOCKWIDTH_WITH_SET
          : stockWidthTemp;
    },
    _progressIncrease() {
      this.progress = (this.progress + 1) % 101;
    }
  },
  components: {
    Peity,
    ScrollMsgLine
  }
};
</script>

<style lang="stylus">
* {
  margin: 0;
  padding: 0;
  text-align: center;
}

html {
  font-size: 20px;
}

.stock {
  // width: 680px;
  height: 100%;
  position: relative;
  // background-color #eee
}

.stock input {
  padding-left: 0;
  padding-right: 0;
}

.input {
  padding: 1.5rem 0 0;
}

.add-stock input {
  text-align: left;
}

.stock-up .cell, .stock-down .cell {
  color: #fff;
  font-weight: 700;
  height: 1.25rem;
  line-height: 1.25rem;
  width: 80%;
  border-radius: 0.25rem;
}

.stock-up .cell {
  background-color: rgba(255, 75, 75, 1);
}

.stock-down .cell {
  background-color: rgba(15, 175, 75, 1);
}

td .cell {
  margin: 0 auto;
}

.el-table tbody .el-table_1_column_1 .cell {
  line-height: 0.8rem;
  width: 5rem;
}

.el-table th {
  padding-top: 0px;
}

a.stock-link {
  font-size: 0.8rem;
  color: black;
  font-weight: 500;
  text-decoration: none;

  .stock-code {
    display: block;
    font-size: 0.5rem;
    font-weight: 300;
  }
}

.el-scrollbar {
  .el-autocomplete-suggestion__wrap {
    max-height: 5rem;
  }
}

.set-mode-checked-wrapper, .progress-wrapper {
  display: inline-block;
}

.set-mode-checked-wrapper {
  padding-top: 8px;
  padding-bottom: 10px;
  padding-left: 5px;
  float: right;
}

.progress-wrapper {
  padding-top: 10px;
  padding-right: 5px;
  float: left;
}

td .cell, th .cell {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.el-checkbox-group .el-checkbox {
  height: 28px;
}

.announcement-wrapper {
  display: inline-block;
  float: left;
  padding-top: 8px;
  width: 100px;
}

.footer {
  background: #fff;
  position: fixed;
  bottom: 0;
  height: 39px;
  z-index: 1;
}

.main {
  padding-bottom: 30px;
  z-index: -1;
}

.footerWithSetMode {
  height: 219px !important;
}

.mainWithSetMode {
  padding-bottom: 210px !important;
}

</style>
