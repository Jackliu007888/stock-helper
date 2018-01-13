<template>
  <div class="stock">
    <!-- <h1>{{lodingMsg}}</h1> -->
    <div class="header-line">
      <el-table
        size="mini"
        :data="stocks"
        style="width: 100%"
        :default-sort = "{prop: 'range', order: 'descending'}"
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
          prop="curPrice"
          label="最新价"
          width="90"
          sortable>
        </el-table-column>
          
        <el-table-column
          label="涨跌幅"
          prop="range"
          width="90"
          :formatter="formatter"      
          sortable>
        </el-table-column>        
        
        <el-table-column
          prop="rangePrice"
          label="涨跌额"
          :class-name="stocks.rangePrice > 0 ? 'a' : 'b'"
          width="90"      
          sortable>
        </el-table-column>

        <el-table-column
          prop="profit"
          label="盈亏"
          width="90"      
          sortable>
        </el-table-column>

        <el-table-column
          prop="cost"
          label="成本">
        </el-table-column>
          
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="deleteRow(scope.$index,  scope.row)"
              type="text"
              width="45"
              size="mini">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="input">
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
  </div>    
</template>
<script>
import { getStockByCode, getStockBySuggest } from './api/api';
import { check, getRightShock } from './api/base';
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
  },
  mounted() {
    setInterval(() => {
      this._getALLStock(this.localStock);
    }, 10000);
  },
  watch: {
    stocks: function() {
      console.log('watch stocks', this.stocks);
    },
    localStock: function() {
      localStorage.localStock = JSON.stringify(this.localStock);
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
      if (rows.columnIndex != '2' && rows.columnIndex != '3') {
        return '';
      } else {
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
      this.localStock = (localStorage.localStock && JSON.parse(localStorage.localStock).length>0) ? JSON.parse(localStorage.localStock): conShock;
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
  width: 30rem;
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
</style>
