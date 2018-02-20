<template>
  <div class="stock" ref="stock">
    <div class="main" :class="{ mainWithSetMode: setModeChecked }">
      <div class="loading" v-if="!stocks.length">
        <span>{{lodingMsg}}</span>
      </div>
      <div class="header-line" v-if="stocks.length">
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
              <!-- <a class="stock-link" :href="`http://stockpage.10jqka.com.cn/${scope.row.code.slice(2)}/`" target="_blank">{{scope.row.name}}<span class='stock-code'>{{scope.row.code}}</span></a> -->
              <a class="stock-link" :href="`http://finance.sina.com.cn/realstock/company/${scope.row.code}/nc.shtml`" target="_blank">{{scope.row.name}}<span class='stock-code'>{{scope.row.code}}</span></a>
            </template>
          </el-table-column>

          <el-table-column
            prop="curPrice"
            label="现价"
            :formatter="formatterFixedTwo"
            width="50"
            :sortable="!setModeChecked">
          </el-table-column>
            
          <el-table-column
            label="涨跌幅"
            prop="range"
            width="70"
            :formatter="formatter"
            :sortable="!setModeChecked">
          </el-table-column>        
          
          <el-table-column
            prop="rangePrice"
            label="涨跌额"
            width="70"
            :formatter="formatterFixedTwo"      
            :sortable="!setModeChecked">
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('toPrice') != -1 && !setModeChecked"
            prop="toPrice"
            label="今开"
            :formatter="formatterFixedTwo"
            width="40">
            <template slot-scope="scope">
              <span v-html="scope.row.toPrice"></span>
            </template>
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('highPrice') != -1 && !setModeChecked"
            prop="highPrice"
            label="最高"
            :formatter="formatterFixedTwo"
            width="40">
            <template slot-scope="scope">
              <span v-html="scope.row.highPrice"></span>
            </template>
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('lowPrice') != -1 && !setModeChecked"
            prop="lowPrice"
            label="最低"
            :formatter="formatterFixedTwo"
            width="40">
            <template slot-scope="scope">
              <span v-html="scope.row.lowPrice"></span>
            </template>
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('profit') != -1 && !setModeChecked"
            prop="profit"
            label="盈亏"
            width="50"
            :sortable="!setModeChecked">
            <template slot-scope="scope">
              <span v-html="scope.row.profit"></span>
            </template>
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('cost') != -1 || setModeChecked"
            label="成本"
            width="45">
            <template slot-scope="scope">
              <el-input v-show="scope.row.edit" v-model="localStock[scope.$index].cost" size="mini"></el-input>
              <span v-show="!scope.row.edit">{{ scope.row.cost }}</span>
            </template>
          </el-table-column>

          <el-table-column
            v-if="colList.indexOf('count') != -1 || setModeChecked"
            label="持仓"
            width="45">
            <template slot-scope="scope">
              <el-input v-show="scope.row.edit" v-model="localStock[scope.$index].count" size="mini"></el-input>
              <span v-show="!scope.row.edit">{{ scope.row.count }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="上限"
            v-if="setModeChecked"
            width="45">
            <template slot-scope="scope">
              <el-input v-show="scope.row.edit" v-model="localStock[scope.$index].upLimit" size="mini"></el-input>
              <span v-show="!scope.row.edit">{{ localStock[scope.$index].upLimit }}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="下限"
            v-if="setModeChecked"
            width="45">
            <template slot-scope="scope">
              <el-input v-show="scope.row.edit" v-model="localStock[scope.$index].downLimit" size="mini"></el-input>
              <span v-show="!scope.row.edit">{{ localStock[scope.$index].downLimit }}</span>
            </template>
          </el-table-column>   

          <el-table-column
            label="走势图"
            width="100"
            v-if="colList.indexOf('chart') != -1 && !setModeChecked"
            >
            <template slot-scope="props">
              <peity v-if="props.row.lineData.length" :type="setPeity.type" :options="setPeity.options" :data="props.row.lineData"></peity>
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            fixed="right"
            width="145"
            v-if="setModeChecked"
            >
            <template slot-scope="scope" v-if="setModeChecked">
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
                {{ scope.row.edit ? '完成' : '编辑' }}
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
      <div class="bottom">
        <div class="progress-wrapper">
          <el-progress type="circle" :stroke-width="3" :width="20" :percentage="progress" :show-text="false"></el-progress>
        </div>
        <!-- "https://wallstreetcn.com/live/a-stock" -->
        <div class="announcement-wrapper" :style="{ width: announcementWidth + 'px' }" @click="openWallStreetUrl">
          <ScrollMsgLine :data="announcements"></ScrollMsgLine>
        </div>
        <div class="set-mode-checked-wrapper">
          <el-switch
            v-model="setModeChecked"
            active-text="">
          </el-switch>
        </div>
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
      // console.log(this.formInline.code);
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
        count: ''
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
    // 获得股票数据, 打开设置的时候不更新
    if (this.setModeChecked) {
      setInterval(() => {
        this._getALLStock(this.localStock);
      }, 10000);
    }
    // 进度条
    setInterval(() => {
      this._progressIncrease();
    }, 100);
    // 获取走势图
    this.$nextTick(() => {
      this._getALLStockTrade(this.localStock);
    });
  },
  watch: {
    stocks() {
      console.log('watch stocks', this.stocks);
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
      this._setStockWidth();
    },
    setModeChecked: function(val) {
      this._setStockWidth();
      // 只要打开设置，就取消排序
      if (val) {
        this.$refs.stockTable.clearSort();
      }
      this.$nextTick(() => {
        this.stocks.forEach((item, index) => {
          let tempStock = item;
          tempStock.setModeChecked = this.setModeChecked;
          this.stocks.splice(index, 1, tempStock);
          // console.log(item);
        });
      });
    }
  },
  computed: {
    sortStocks() {
      var stocksTemp = this.stocks;
      // 排序
      return stocksTemp.sort(
        (a, b) =>
          this.localStock.indexOfAtt(a.code, 'code') -
          this.localStock.indexOfAtt(b.code, 'code')
      );
    },
    localStockLength() {
      return this.localStock.length;
    },
    announcementWidth() {
      return this.stockWidth - 78;
    }
  },
  methods: {
    openWallStreetUrl() {
      window.open('https://wallstreetcn.com/live/a-stock');
    },
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
      return row[column['property']].toFixed(2);
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
      // 定义两个变量 减少引用次数
      let curStock = this.stocks[index];
      let locStock = this.localStock[index];
      if (curStock.edit) {
        this.$set(curStock, 'edit', false);
        curStock.cost = locStock.cost;
        curStock.count = locStock.count;
        curStock.upLimit = locStock.upLimit;
        curStock.downLimit = locStock.downLimit;
        curStock.profit =
          curStock.curPrice == 0 || curStock.cost == 0
            ? 0
            : getFixedNum(
                (curStock.curPrice - curStock.cost) * curStock.count,
                3
              );
      } else {
        this.$set(curStock, 'edit', true);
        if (this.colList.indexOf('downLimit') == -1)
          this.colList.push('downLimit');
        if (this.colList.indexOf('cost') == -1) this.colList.push('cost');
        if (this.colList.indexOf('count') == -1) this.colList.push('count');
        this.stocks.forEach((val, idx) => {
          if (index != idx && val.edit == true) {
            this.$set(this.stocks[idx], 'edit', false);
            this.stocks[idx].cost = this.localStock[idx].cost;
            this.stocks[idx].count = this.localStock[idx].count;
            this.stocks[idx].upLimit = this.localStock[idx].upLimit;
            this.stocks[idx].downLimit = this.localStock[idx].downLimit;
            this.stocks[idx].profit =
              this.stocks[idx].curPrice == 0 || this.stocks[idx].cost == 0
                ? 0
                : getFixedNum(
                    (this.stocks[idx].curPrice - this.stocks[idx].cost) *
                      this.stocks[idx].count,
                    3
                  );
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
      let { cost, count, upLimit, downLimit } = this.formInline;
      cost = cost ? cost : 0
      count = count ? count : 0
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
        this._getStockTrade(allStock[i].code);
      }
    },
    _initGetStock() {
      const conShock = [
        { cost: 0, code: 'sz002183', count: '0', downLimit: 0, upLimit: 0 }
      ];
      const colList = ['profit', 'chart'];

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
        let { code, cost, count, upLimit, downLimit } = allStock[i];
        setTimeout(() => {
          this._getStockByCode(code, cost, count, upLimit, downLimit);
        }, 30);
      }
    },
    _getStockTrade(code = 'sz002183') {
      getStockTrade(code).then(res => {
        this.data = getStockTradeDetail(res).toString();
        var idxOfStocks = this.stocks.indexOfAtt(code, 'code');
        var stocks = this.stocks;
        if (idxOfStocks >= 0) {
          stocks[idxOfStocks]['lineData'] = this.data.toString();
          this.stocks.splice(idxOfStocks, 1, stocks[idxOfStocks]);
        } else {
          console.log(code);
          this.stocks.push({ code, lineData: this.data.toString() });
        }
      });
    },
    _getStockByCode(
      code = 'sz002183',
      cost = 0,
      count = '0',
      upLimit = 0,
      downLimit = 0
    ) {
      getStockByCode(code).then(res => {
        var stockObj = getStockDetail(res, code, cost, count);

        if (stockObj) {
          var idxOfStocks = this.stocks.indexOfAtt(code, 'code');
          var idxOfLocalStock = this.localStock.indexOfAtt(code, 'code');
          // 编辑状态标记
          if (idxOfStocks > 0) {
            stockObj['edit'] = this.stocks[idxOfStocks]['edit']
              ? this.stocks[idxOfStocks]['edit']
              : false;
          }
          // 更新this.stocks
          if (idxOfStocks >= 0) {
            // 已存在，不更新lineData
            stockObj['lineData'] = this.stocks[idxOfStocks]['lineData']
              ? this.stocks[idxOfStocks]['lineData']
              : [];
            this.stocks.splice(idxOfStocks, 1, stockObj);
          } else {
            stockObj['lineData'] = [];
            this.stocks.push(stockObj);
          }

          if (idxOfLocalStock < 0) {
            this.localStock.push({ code, cost, count, upLimit, downLimit });
            this.formInline.code = '';
            this.formInline.cost = '';
            this.formInline.count = '';
          }
        }
      });
    },
    _getAnnouncement(limit = 20) {
      getAnnouncement(limit).then(res => {
        this.announcements = getAnnouncementDetail(res);
        console.log(this.announcements);
      });
    },
    _setStockWidth() {
      // debugger
      var baseWidth =
        getColWidth('init') +
        getColWidth('curPrice') +
        getColWidth('range') +
        getColWidth('rangePrice');
      var stockWidthTemp = 0;
      this.colList.forEach(function(val, idx) {
        console.log(val, getColWidth(val));
        stockWidthTemp += getColWidth(val);
      });
      this.stockWidth =
        stockWidthTemp < MIN_STOCKWIDTH_WITH_SET && this.setModeChecked
          ? MIN_STOCKWIDTH_WITH_SET
          : stockWidthTemp;
      // 如果打开设置， 宽度为固定宽度；股票、现价、涨跌幅、涨跌额、上限、下限、成本、持仓、操作
      if (this.setModeChecked) {
        this.stockWidth =
          baseWidth +
          getColWidth('set') +
          getColWidth('upLimit') +
          getColWidth('downLimit') +
          getColWidth('cost') +
          getColWidth('count');
      } else {
        this.stockWidth = stockWidthTemp + baseWidth;
      }
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
  padding: 0.6rem 0 0;
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

td .cell, th .cell {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.el-checkbox-group .el-checkbox {
  height: 28px;
}

.footer {
  width: 100%;
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
  height: 170px !important;
}

.mainWithSetMode {
  padding-bottom: 170px !important;
}

.bottom {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.announcement-wrapper {
  padding-top: 6px;
  width: 50px;
}

.announcement-wrapper:hover {
  cursor: pointer;
}

.set-mode-checked-wrapper {
  flex-shrink: 0;
  padding-top: 6px;
  padding-bottom: 10px;
  padding-left: 5px;
  padding-right: 10px;
}

.progress-wrapper {
  flex-shrink: 0;
  padding-top: 8px;
  padding-right: 5px;
}

body {
  padding: 0.2rem;
}

.loading {
  height: 2rem;

}
</style>
