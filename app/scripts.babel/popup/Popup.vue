<template>
  <div class="stock" ref="stock">
    <!-- <h1>{{lodingMsg}}</h1> -->
    <div class="header-line">
      <el-table
        align="center"
        header-align="center"
        size="mini"
        :data="stocks"
        style="width: 100%"
        :cell-class-name = 'cellClassName'
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
          label="最新价"
          width="90"
          sortable>
        </el-table-column>
          
        <el-table-column
          v-if="colList.indexOf('range') != -1"
          label="涨跌幅"
          prop="range"
          width="90"
          :formatter="formatter"
          sortable>
        </el-table-column>        
        
        <el-table-column
          v-if="colList.indexOf('rangePrice') != -1"
          prop="rangePrice"
          label="涨跌额"
          :class-name="stocks.rangePrice > 0 ? 'a' : 'b'"
          width="90"      
          sortable>
        </el-table-column>

        <el-table-column
          v-if="colList.indexOf('profit') != -1"
          prop="profit"
          label="盈亏"
          width="90"
          sortable>
        </el-table-column>

        <el-table-column
          v-if="colList.indexOf('cost') != -1"
          prop="cost"
          label="成本"
          width="90">
        </el-table-column>
          
        <el-table-column
          label="操作"
          width="140"
          v-if="setModeChecked"
          >
          <template slot-scope="scope">
            <el-button
              @click.native.prevent=""
              type="text"
              size="mini">
              上移
            </el-button>
            <el-button
              @click.native.prevent=""
              type="text"
              size="mini">
              下移
            </el-button>
            <el-button
              @click.native.prevent="deleteRow(scope.$index,  scope.row)"
              type="text"
              size="mini">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
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
        <el-form-item label="持仓成本">
          <el-input 
            v-model="formInline.cost" 
            placeholder="请输入持仓成本"
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
          <el-checkbox label="cost">成本</el-checkbox>
        </el-checkbox-group>
      </template>
    </div>
    <div class="progress-wrapper">
      <el-progress type="circle" :stroke-width="3" :width="20" :percentage="progress" :show-text="false"></el-progress>
    </div>
    <div class="set-mode-checked-wrapper">
      <el-switch
        v-model="setModeChecked"
        active-text="设置">
      </el-switch>
    </div>
  </div>    
</template>
<script>
import { getStockByCode, getStockBySuggest } from './api/api';
import { check, getRightShock, getColWidth, getInitStockWidth } from './api/base';
import { getSuggestList, getStockDetail } from './api/former';
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
      lodingMsg: 'loading...',
      stocks: [],
      suggests: [],
      localStock: [],
      stockList: [],
      formInline: {
        code: '',
        cost: ''
      },
      setModeChecked: true,
      colList: [],
      stockWidth: 0,
      progress: 0,
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
    console.log(localStorage.localStock);
  },
  mounted() {
    setInterval(() => {
      this._getALLStock(this.localStock);
    }, 10000);
    setInterval(() => {
      this._progressIncrease();
    }, 100);
  },
  watch: {
    stocks: function() {
      console.log('watch stocks', this.stocks);
    },
    localStock: function() {
      localStorage.localStock = JSON.stringify(this.localStock);
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
    }
  },
  methods: {
    querySearch(queryString, cb) {
      getStockBySuggest(queryString).then(res => {
        var suggestList = getSuggestList(res)
        var result = queryString ? suggestList.filter(this.createFilter(queryString)) : suggestList
        cb(result)
      });
    },
    createFilter(queryString) {
      return (restaurant) => {
        // return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        return (check(restaurant.value.slice(-6)))
      };
    },
    handleSelect(item) {
      this.formInline.code = item.value;
    },
    cellClassName(rows, columns, rowIndex, columnIndex) {
      if(rows.column.label == '涨跌幅' || rows.column.label == '涨跌额') {
        return rows.row.rangePrice > 0 ? 'stock-up' : 'stock-down';
      }
    },
    formatter(row, column) {
      return row.range + '%';
    },
    deleteRow(index, rows) {
      var that = rows;
      this.localStock.splice(this.localStock.indexOfAtt(that.code,'code'), 1)
      this.stocks.remove(that);
    },
    addStock(formName) {
      let code = this.formInline.code.slice(-8);
      let cost = this.formInline.cost || 0;
      this.$refs[formName].validate(valid => {
        if (valid) {
          this._getStockByCode(code, cost);
        } else {
          return;
        }
      });
    },
    _initGetStock() {
      const conShock = [{ cost: 0, code: 'sz002183' }];
      const colList = ['curPrice', 'range', 'rangePrice', 'profit', 'cost'];

      this.colList = (localStorage.colList && JSON.parse(localStorage.colList).length > 0) ? JSON.parse(localStorage.colList): colList;
      this.localStock = (localStorage.localStock && JSON.parse(localStorage.localStock).length > 0) ? JSON.parse(localStorage.localStock): conShock;
      this._getALLStock(this.localStock);
    },
    _getALLStock(allStock) {
      for (let i = 0; i < allStock.length; i++) {
        var that = this;
        setTimeout(() => {
          this._getStockByCode(allStock[i].code, allStock[i].cost);
        }, 30);
      }
    },
    _getStockByCode(code, cost) {
      getStockByCode(code).then(res => {
        var stockObj = getStockDetail(res, code, cost);

        if (stockObj) {
          var idxOfStocks = this.stocks.indexOfAtt(code, 'code')
          var idxOfLocalStock = this.localStock.indexOfAtt(code, 'code')
          idxOfStocks >= 0 ? this.stocks.splice(idxOfStocks, 1, stockObj) : this.stocks.push(stockObj)
          idxOfLocalStock < 0 && this.localStock.push({ code: code, cost: cost }) && (this.formInline.code = '' , this.formInline.cost = '')
        }
      });
    },
    _setStockWidth() {
      var stockWidthTemp = this.setModeChecked ? getColWidth('init') + getColWidth('set') : getColWidth('init');
      this.colList.forEach(function(val, idx) {
        stockWidthTemp += getColWidth(val);
      });
      this.stockWidth = stockWidthTemp < 590 && this.setModeChecked ? 590 : stockWidthTemp;
    },
    _progressIncrease() {
      this.progress = (this.progress + 1) % 101;
    }
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
  margin:0 auto;
}

.el-table tbody .el-table_1_column_1 .cell {
  line-height: 0.8rem;
  width: 5rem;
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

.set-mode-checked-wrapper,.progress-wrapper {
  display: inline-block;
}

.set-mode-checked-wrapper {
  padding-top: 10px;
  padding-bottom: 10px;
  float: right;
}

.progress-wrapper {
  padding-top: 10px;
  float: left;
}

</style>
