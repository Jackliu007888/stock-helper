import Peity from '../components/peity.js'
import Utils from './utils'
import ScrollMsgLine from '../components/scroll-msg-line.js'

import {
	getStockByCode,
	getStockBySuggest,
	getStockTrade,
	getAnnouncement
} from './api/api'
import {
	checkAllow,
	getRightShock,
	getColWidth,
	getFixedNum,
	MIN_STOCKWIDTH_WITH_SET
} from './api/base'
import {
	getSuggestList,
	getStockDetail,
	getStockTradeDetail,
	getAnnouncementDetail
} from './api/former'

const ANNOUNCEMENTPADDING = 78
const wallStreetUrl = 'https://wallstreetcn.com/live/a-stock'

const LoadingContent = {
  functional: true,
  render (h, context) {
    return (
      <div class="loading" >
        <span>{context.data.scopedSlots.default({})}</span>
      </div>
    )
  }
}

const NavigationLink = {
  functional: true,
  render (h, context) {
    return (
      <a href={context.props.url} target="_blank" class="nav-link">
        {context.data.scopedSlots.default({})}
      </a>
    )
  } 
}

const getFinanceSinaUrlByCode = code => `http://finance.sina.com.cn/realstock/company/${code}/nc.shtml`

const MainContent = {
  props: [
    'sortStocks',
    'setModeChecked',
    'colList'
  ],
  components: {
    NavigationLink,
    Peity
  },
  slots: {
    nameSlot: {
      default: scope => (
        <navigation-link url={getFinanceSinaUrlByCode(scope.row.code)}>
          {scope.row.name}
          <span class='stock-code'>{scope.row.code}</span>
        </navigation-link>
      )
    },
    costSlot: {
      default: scope => {
        if (scope.row.edit) return <span>{scope.row.cost}</span>

        return (
          <el-input
            data-name="cost"
            value={this.localStock[scope.$index].cost}
            onInput={this.handleEidtChange}
            size="mini" />
        )
      }
    },
    countSlot: {
      default: scope => {
        if (scope.row.edit) return <span>{scope.row.count}</span>

        return (
          <el-input
            data-name="count"
            value={this.localStock[scope.$index].count}
            onInput={this.handleEidtChange}
            size="mini" />
        )
      }
    },
    upLimitSlot: {
      default: scope => {
        if (scope.row.edit) return <span>{scope.row.upLimit}</span>

        return (
          <el-input
            data-name="upLimit"
            value={this.localStock[scope.$index].upLimit}
            onInput={this.handleEidtChange}
            size="mini" />
        )
      }
    },
    downLimitSlot: {
      default: scope => {
        if (scope.row.edit) return <span>{scope.row.downLimit}</span>

        return (
          <el-input
            data-name="downLimit"
            value={this.localStock[scope.$index].downLimit}
            onInput={this.handleEidtChange}
            size="mini" />
        )
      }
    },
    chartSlot: {
      default: scope => {
        const setPeity = {
          type: 'line',
          options: {
            stroke: '#3ca316',
            width: 60,
            height: 20
          }
        }
        if (scope.row.lineData.length) {
          <peity type={setPeity.type} options={setPeity.options} data={scope.row.lineData}></peity>
        }
      }
    },
    operatingSlot: {
      default: scope => {
        return [
          <el-button onClick={this.handleClickEditRowBtn} data-index={scope.$index} type="text" size="mini">
            { scope.row.edit ? '完成' : '编辑' }
          </el-button>,
          <el-button onClick={this.handleClickDeleteRowBtn} data-index={scope.$index} type="text" size="mini">
            移除
          </el-button>
        ]
      }
    }
  },
  methods: {
    cellClassName(rows, columns, rowIndex, columnIndex) {
      if (rows.column.label === '涨跌幅' || rows.column.label === '涨跌额') {
        return rows.row.rangePrice >= 0 ? 'stock-up' : 'stock-down'
      }
    },
    formatterFixedTwo(row, column) {
      return column && column['property'] && row[column['property']]
				? row[column['property']].toFixed(2)
				: '0'
    },
    handleEidtChange () {

    },
    clearSort() {
      this.$refs.stockTable.clearSort()
    }
  },
  render(h) {
    const shouldRender = name => this.colList.includes(name) && !this.setModeChecked

    return (
      < div class="header-line" >
        <el-table
          align="center"
          header-align="center"
          size="mini" 
          data={this.sortStocks}
          style="width: 100%"
          cell-class-name={this.cellClassName}
          ref="stockTable">
          <el-table-column label="股票" scopedSlots={this.$options.slots.nameSlot} />
          <el-table-column width="50" prop="curPrice" label="现价" formatter={this.formatterFixedTwo} sortable={!this.setModeChecked} />
          <el-table-column width="70" prop="range" label="涨跌幅" formatter={this.formatter} sortable={!this.setModeChecked} />>
          <el-table-column width="70" prop="rangePrice" label="涨跌额" formatter={this.formatterFixedTwo} sortable={!this.setModeChecked} />
          {
            shouldRender('toPrice') && (
              <el-table-column width="45" prop="toPrice" label="今开" formatter={this.formatterFixedTwo}  />
            )
          }
          {
            shouldRender('highPrice') && (
              <el-table-column width="45" prop="highPrice" label="最高" formatter={this.formatterFixedTwo}  />
            )
          }
          {
            shouldRender('lowPrice') && (
              <el-table-column width="45" prop="lowPrice" label="最低" formatter={this.formatterFixedTwo}  />
            )
          }
          {
            shouldRender('profit') && (
              <el-table-column width="50" prop="profit" label="盈亏" formatter={this.formatterFixedTwo} sortable={!this.setModeChecked}  />
            )
          }
          {
            shouldRender('cost') && (
              <el-table-column width="50" label="成本" scopedSlots={this.$options.slots.costSlot} />
            )
          }
          {
            shouldRender('count') && (
              <el-table-column width="50" label="持仓" scopedSlots={this.$options.slots.countSlot} />
            )
          }
          {
            shouldRender('upLimit') && (
              <el-table-column width="50" label="上限" scopedSlots={this.$options.slots.upLimitSlot} />
            )
          }
          {
            shouldRender('downLimit') && (
              <el-table-column width="50" label="下限" scopedSlots={this.$options.slots.downLimitSlot} />
            )
          }
          {
            shouldRender('chart') && (
              <el-table-column width="50" label="走势图" scopedSlots={this.$options.slots.chartSlot} />
            )
          }
          {
            this.setModeChecked && (
              <el-table-column width="45" label="操作" fixed="right" scopedSlots={this.$options.slots.operatingSlot} />
            )
          }
        </el-table> 
      </div >
    )
  }
}

const FormContent = {
  props: ['formInline'],
  data() {
    // 检查输入合法性
    const checkStock = (rule, value, callback) => {
      setTimeout(() => {
        if (!checkAllow(this.formInline.code.slice(-6))) {
          callback(new Error('请输入正确的股票代码'))
        } else {
          callback()
        }
      }, 500)
    }

		// 检查是否重复输入
    const checkRepeat = (rule, value, callback) => {
      if (this.localStock.indexOfAtt(value.slice(-8), 'code') > -1) {
        callback(new Error('股票已存在，请勿重复添加！'))
      } else {
        callback()
      }
    }
    return {
      rules: {
        code: [
					{ required: true, message: '请输入股票名称或代码', trigger: 'blur' },
					{ validator: checkStock, trigger: 'blur' },
					{ validator: checkRepeat, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleFormInlineChange(key) {
      return value => {
        this.$emit('formInlineChange', {key, value})
      }
    },
    handleSelect(value) {
      this.$emit('select', value)
    },
    handleAddStock() {
      this.$refs.formInline.validate(valid => {
        if (valid) {
          this.$emit('addStock')
        } 
      })
    },
    querySearch(queryString, cb) {
      const createFilter = queryString => {
        return restaurant => checkAllow(restaurant.value.slice(-6))
      }
      getStockBySuggest(queryString).then(res => {
        let suggestList = getSuggestList(res)
        debugger

        let result = queryString
          ? suggestList.filter(createFilter(queryString))
          : suggestList
        cb(result)
      })
    }
  },
  render(h) {
    return (
      <el-form
        ref="formInline"
        inline={true}
        model={this.formInline}
        class="demo-form-inline"
        size="mini"
        rules={this.formRules}>
        <el-form-item label="股票代码" prop="code">
          <el-autocomplete
            value={this.formInline.code} 
            onInput={this.handleFormInlineChange('code')}
            fetch-suggestions={this.querySearch} 
            trigger-on-focus={false} 
            onSelect={this.handleSelect} 
            placeholder="请输入股票代码或股票名" 
            clearable />
        </el-form-item>
        <el-form-item label="成本价">
          <el-input
            onInput={this.handleFormInlineChange('cost')}
            value={this.formInline.cost}
            placeholder="请输入持仓成本"
            clearable />
        </el-form-item>
        <br />
        <el-form-item label="持股量">
          <el-input
            onInput={this.handleFormInlineChange('count')}
            value={this.formInline.count}
            placeholder="请输入持股量"
            clearable />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary" 
            onClick={this.handleAddStock}
          >添加</el-button>
        </el-form-item>
      </el-form>
    )
  }
}
const CheckBoxGroup = {
  props: ['colList'],
  methods: {
    handleInputChange(value) {
      this.$emit('checkboxChange', value)
    }
  },
  render(h) {
    return (
      <el-checkbox-group onInput={this.handleInputChange} value={this.colList} min={1}>
        <el-checkbox label="profit">盈亏</el-checkbox>
        <el-checkbox label="toPrice">今开</el-checkbox>
        <el-checkbox label="highPrice">最高</el-checkbox>
        <el-checkbox label="lowPrice">最低</el-checkbox>
        <el-checkbox label="cost">成本</el-checkbox>
        <el-checkbox label="count">持仓</el-checkbox>
        <el-checkbox label="chart">走势图</el-checkbox>
      </el-checkbox-group>
    )
  }
}

const BottomContent = {
  props: [
    'announcements',
    'announcementWidth',
    'setModeChecked',
    'progress'
  ],
  components: {
    ScrollMsgLine
  },
  methods: {
    openWallStreetUrl() {
      window.open(wallStreetUrl)
    },
    handleSetModeChecked(val) {
      this.$emit('setModeCheckedChange', val)
    }
  },
  render(h) {
    return (
      <div class="bottom">
        <div class="progress-wrapper">
          <el-progress
            type="circle"
            stroke-width={3}
            width={20}
            percentage={this.progress}
            show-text={false}>
          </el-progress>
        </div>
        <div
          class="announcement-wrapper"
          style={{ width: this.announcementWidth + 'px' }}
          onClick={this.openWallStreetUrl}>
          <scroll-msg-line data={this.announcements} />
        </div>
        <div class="set-mode-checked-wrapper">
          <el-switch value={this.setModeChecked} onInput={this.handleSetModeChecked} active-text="" />
        </div>
      </div>
    )
  }
}

const initFormInlineData = () => ({
  code: '',
  cost: '',
  count: ''
})
export default {
  components: {
    LoadingContent,
    MainContent,
    CheckBoxGroup,
    FormContent,
    BottomContent
  },
  data() {
    return {
      progress: 0,
      announcements: [],
      colList: [], // 设置显示项
      setModeChecked: false, // 打开设置状态
      stocks: [], // 股票列表
      stockNameList: [], // 股票名称列表
      suggests: [],
      localStock: [],
      stockList: [],
      formInline: initFormInlineData()
    }
  },
  loadingMsg: '数据加载中...',
  computed: {
    stockWidth() {
      const baseWidth = ['init', 'curPrice', 'range', 'rangePrice'].map(d => getColWidth(d)).reduce((acc, cur) => acc + cur, 0)
      const otherWidth = ['set', 'upLimit', 'downLimit', 'cost', 'count'].map(d => getColWidth(d)).reduce((acc, cur) => acc + cur, 0)
      const settingsWidth = this.colList.map(d => getColWidth(d)).reduce((acc, cur) => acc + cur, 0)
      
      // 如果打开设置， 宽度为固定宽度；股票、现价、涨跌幅、涨跌额、上限、下限、成本、持仓、操作
      // 关闭设置状态， 宽度为基本宽度 + 设置项宽度
      return this.setModeChecked ? baseWidth + otherWidth : settingsWidth + baseWidth
    }
  },
  watch: {
    stockWidth(val) {
      this.$refs.stock.style.width = val.toString() + 'px'
    },
    colList() {
      localStorage.setItem('colList', JSON.stringify(this.colList))
    },
    localStock: {
      handler() {
        localStorage.setItem('localStock', JSON.stringify(this.localStock))
      },
      deep: true
    },
    setModeChecked(val) {
      if (val) {
        this.$refs.mainContent.clearSort()
      }
      
      this.$nextTick(() => {
        this.stocks.map((item, index) => {
          let tempStock = item
          tempStock.setModeChecked = this.setModeChecked
          this.stocks.splice(index, 1, tempStock)
        })
      })
    }
  },
  mounted() {
		// 获得股票数据, 每 10s 更新一次。打开设置的时候不更新
    setInterval(() => {
      if (!this.setModeChecked) {
        this._getALLStock(this.localStock)
      }
    }, 10000)
    
		// 进度条
    setInterval(() => {
      this._progressIncrease()
    }, 100)
    
    // 获取走势图
    this.$nextTick(() => {
      this._getALLStockTrade(this.localStock)
    })
  },  
  methods: {
    _getALLStockTrade(allStock) {
      allStock.forEach(code => {
        this._getStockTrade(code)
      })
    },
    _getStockTrade(code) {
      if (!code) return false

      getStockTrade(code).then(res => {
        this.data = getStockTradeDetail(res)
        let idxOfStocks = this.stocks.indexOfAtt(code, 'code')
        if (idxOfStocks >= 0) {
          this.stocks[idxOfStocks]['lineData'] = this.data.toString()
          this.stocks.splice(idxOfStocks, 1, this.stocks[idxOfStocks])
        } else {
          this.stocks.push({ code, lineData: this.data.toString() })
        }
      })
    },
    /**
     * 初始化本地股票信息
     */
    _initGetStock() {
      // 默认股票
      const initShock = {
        sh000001: {
          cost: 0, 
          code: 'sh000001', 
          count: 0, 
          downLimit: 0, 
          upLimit: 0
        }
      }
      const initColList = ['profit', 'chart']

      this.colList =
        localStorage.getItem('colList') && JSON.parse(localStorage.getItem('colList')).length > 0
          ? JSON.parse(localStorage.getItem('colList'))
          : initColList
      
      this.localStock =
        localStorage.getItem('localStock') && localStorage.getItem('localStock') !== '{}'
          ? JSON.parse(localStorage.localStock)
          : initShock
      
      this._getALLStock(Object.values(this.localStock))
    },
    /**
     * 根据股票信息数组获取股票交易信息
     * @param {*} allStock 
     */
    _getALLStock(stockList) {
      stockList.forEach(stock => {
        let { code, cost, count, upLimit, downLimit } = stock
        this._getStockByCode(code, cost, count, upLimit, downLimit)
      })
    },
    _getStockByCode(code, cost = 0, count = 0, upLimit = 0, downLimit = 0) {
      if (!code) return false
      
      getStockByCode(code).then(res => {
        let stockObj = getStockDetail({res, code, cost, count})

        if (stockObj) {
          const item = this.stocks[code]

          if (this.stockNameList.includes(code)) {
            // 已存在，不更新lineData
            stockObj['lineData'] = item['lineData']
              ? item['lineData']
              : ''
            
          } else {
            stockObj['lineData'] = ''
          }
          this.stocks = Object.assign({}, this.stocks, {
            [code]: stockObj
          })

          if (!Object.Keys(this.localStock).includes(code)) {
            this.localStock = Object.assign({}, {
              [code]: { code, cost, count, upLimit, downLimit }
            })

            this.formInline = initFormInlineData()
          }
        }
      })
    },
    _getAnnouncement(limit = 20) {
      getAnnouncement(limit).then(res => {
        this.announcements = getAnnouncementDetail(res)
      })
    },
    _progressIncrease() {
      this.progress = (this.progress + 1) % 101
    },
    handleFormInlineChange({key, value}) {
      this.formInline = Object.assign({}, this.formInline, {
        [key]: value
      })
    },
    handleFormInlineSelect({code}) {
      this.handleFormInlineChange({key: 'code', value: code})
    },
    handleAdddStock() {
      let code = this.formInline.code.slice(-8)
      let { cost, count } = this.formInline
      cost = cost ? cost : 0
      count = count ? count : 0
      
      this._getStockByCode(code, cost, count)
      this._getStockTrade(code)
    },
    hadnleSetModeChecked(val) {
      this.setModeChecked = val
    }
  },
  render (h) {
    return (
      <div class="stock" ref="stock">
        <div class="main" class={{ 'setMode-main': this.setModeChecked }}>
          {
            !this.stocks ? (
              <loading-content>{this.$options.loadingMsg}</loading-content>
            ) : (
              <main-content
                ref='mainContent'
                colList={this.colList} />
            )
          }
        </div>
        <div class="footer" class={{ 'setMode-footer': this.setModeChecked }}>
          {
            this.setModeChecked && [
              <form-content
                formInline={this.formInline}
                onSelect={this.handleFormInlineSelect}
                onAddStock={this.handleAdddStock}
                onFormInlineChange={this.handleFormInlineChange}
              />,
              <check-box-group />
            ]
          }
          <bottom-content
            setModeChecked={this.setModeChecked}
            announcements={this.announcements}
            announcementWidth={this.announcementWidth}
            progress={this.progress}
            onSetModeCheckedChange={this.hadnleSetModeChecked}
          />
        </div>
      </div>
    )
  }
}
