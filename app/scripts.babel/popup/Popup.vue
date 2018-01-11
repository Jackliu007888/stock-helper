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
      <el-form :inline="true" ref="formInline" :model="formInline" class="demo-form-inline" size="mini" :rules="rules">
        <el-form-item label="股票代码" prop="code">
          <el-input v-model="formInline.code" placeholder="请输入6位股票代码"></el-input>
        </el-form-item>
        <el-form-item label="持仓成本">
          <el-input v-model="formInline.cost" placeholder="请输入持仓成本"></el-input>
        </el-form-item>          
        <el-form-item>
          <el-button type="primary" @click="addStock('formInline')">添加</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>    
</template>
<script>
import { getStockByCode } from './api/api';
import { check, getRightShock } from './api/base';
export default {
  data() {
    var checkStock = (rule, value, callback) => {
      if (!check(value)) {
        callback(new Error('请输入正确的股票代码'));
      } else {
        callback();
      }
    };
    var checkRepeat = (rule, value, callback) => {
      if (this.stockCodeList.indexOf(getRightShock(value)) > -1) {
        callback(new Error('股票已存在，请勿重复添加！'));
      } else {
        callback();
      }
    };
    return {
      lodingMsg: 'loading...',
      stocks: [],
      costList: [],
      stockCodeList: [],
      formInline: {
        code: '',
        cost: ''
      },
      rules: {
        code: [
          { required: true, message: '请输入6位股票代码', trigger: 'blur' },
          { min: 6, max: 6, message: '长度为6位数字', trigger: 'blur' },
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
      this._getALLStock(this.stockCodeList, this.costList);
    }, 10000);
  },
  watch: {
    stockCodeList: function() {
      localStorage.stockCodeList = this.stockCodeList;
      console.log('refresh stockCodeList', this.stockCodeList);
    },
    stocks: function() {
      console.log('refresh stocks', this.stocks);
    },
    costList: function() {
      localStorage.costList = this.costList;
    }
  },
  methods: {
    cellClassName(rows, columns, rowIndex, columnIndex) {
      if (rows.columnIndex != '2' && rows.columnIndex != '3' ) {
        return ''
      } else {
        return rows.row.rangePrice > 0 ? 'stock-up' : 'stock-down'
      }
    },
    formatter(row, column) {
      return row.range + '%';
    },
    deleteRow(index, rows) {
      var that = rows;
      // console.log(index)
      // console.log('row', rows)
      this.stockCodeList.remove(that.code);
      this.costList.remove(that.cost);
      this.stocks.remove(that);
    },
    addStock(formName) {
      let code = this.formInline.code;
      let cost = this.formInline.cost || 0;
      this.$refs[formName].validate(valid => {
        if (valid && check(code)) {
          let rightStock = getRightShock(code);
          this._getStockByCode(rightStock, cost);
        } else {
          return;
        }
      });
    },
    _initGetStock() {
      const conShock = 'sz002183';
      this.stockCodeList = (localStorage.stockCodeList &&
        localStorage.stockCodeList.split(',')) || [conShock];
      this.costList = (localStorage.costList && localStorage.costList.split(',')) || [0];
        
      this._getALLStock(this.stockCodeList, this.costList);
        
    },
    _getALLStock(allStock, allCost) {
      for (let i = 0; i < allStock.length; i++) {
        var that = this;
        setTimeout(() => {
          this._getStockByCode(allStock[i], allCost[i]);
        }, 30);
      }
    },
    _getFixedNum(num, digit) {
      digit = digit ? digit : 2;
      return Number(Number(num).toFixed(digit));
    },
    _getStockByCode(code, cost) {
      var thatCost = cost;

      getStockByCode(code).then(res => {
        var result = res.split('=')[1];
        if (!result) {
          console.log('no result');
          return;
        }
        var itemArr = result.split('"')[1].split(',');
        var name = itemArr[0],
          cost = thatCost ? Number(thatCost) : 0,
          toPrice = this._getFixedNum(itemArr[1]), // 今开
          yesPrice = this._getFixedNum(itemArr[2]), // 昨收
          curPrice = this._getFixedNum(itemArr[3]), // 当前价
          highPrice = this._getFixedNum(itemArr[4]), // 最高
          // lowPrice = this._getFixedNum(itemArr[5]), // 未知
          // lowPrice = this._getFixedNum(itemArr[6]), // 未知
          lowPrice = this._getFixedNum(itemArr[7]), // 最低
          date = Number(itemArr[8]), // 日期
          time = Number(itemArr[9]); // 时间
        var rangePrice = this._getFixedNum(curPrice - yesPrice);
        var range = this._getFixedNum((curPrice - yesPrice) / yesPrice * 100);
        var profit = cost == 0 ? 0 : this._getFixedNum(curPrice - cost);
        // console.log(cost)
        // console.log(profit)
        var stockObj = {
          code,
          name,
          toPrice,
          yesPrice,
          curPrice: curPrice,
          highPrice,
          lowPrice,
          rangePrice,
          range,
          date,
          time,
          cost,
          profit
        };

        var indexCode = this.stockCodeList.indexOf(code);
        if (indexCode == -1) {
          this.formInline.code = '';
          this.formInline.cost = '';
          this.stocks.push(stockObj);
          this.stockCodeList.push(code);
          this.costList.push(cost);
        } else {
          this.stocks.splice(indexCode, 1, stockObj);
          this.stockCodeList.splice(indexCode, 1, code);
          this.costList.splice(indexCode, 1, cost);
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

.stock-down .cell{
    background-color: rgba(15, 175, 75, 1);
}

.el-table tbody .el-table_1_column_1 .cell
  line-height 0.8rem
  width 5rem 


a.stock-link 
  font-size: 0.8rem;
  color: black;
  font-weight: 500;
  text-decoration: none;
  .stock-code
    display block
    font-size .5rem
    font-weight 300
</style>
