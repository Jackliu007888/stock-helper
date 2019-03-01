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
        <span>{context.scopedSlots.default({})}</span>
      </div>
    )
  }
}

const NavigationLink = {
  name: 'navigation-link',
  functional: true,
  render (h, context) {
    return (
      <a href={context.props.url} target="_blank" class="nav-link" {...context.props}>
        {context.scopedSlots.default({})}
      </a>
    )
  } 
}

const getFinanceSinaUrlByCode = code => `http://finance.sina.com.cn/realstock/company/${code}/nc.shtml`

const MainContent = {
  props: [
    'sortStocks',
    'setModeChecked',
    'colList',
    'localStocks',
    'editInput'
  ],
  components: {
    NavigationLink,
    Peity
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
    handleEidtChange({name}) {
      return value => {
        this.$emit('editChange', {
          name,
          value
        })
      }
    },
    clearSort() {
      this.$refs.stockTable.clearSort()
    },
    handleClickEditRowBtn(e) {
      const { code } = e.currentTarget.dataset
      this.$emit('editRow', code)
    },
    handleClickDeleteRowBtn(e) {
      const { code } = e.currentTarget.dataset
      this.$emit('deleteRow', code)
    },
    handleMoveUp(e) {
      const { index } = e.currentTarget.dataset
      this.$emit('moveUp', index)
    },
    handleMoveDown(e) {
      const { index } = e.currentTarget.dataset
      this.$emit('moveDown', index)
    }
  },
  render(h) {
    const shouldRender = name => this.colList.includes(name) && !this.setModeChecked
    const setModeCheckedShouldRender = name => this.colList.includes(name) || this.setModeChecked

    const nameSlot ={
      default: (scope) => (
        <navigation-link url={getFinanceSinaUrlByCode(scope.row.code)}>
          {scope.row.name}
          <span class='stock-code'>{scope.row.code}</span>
        </navigation-link>
      )
    }
    const costSlot = {
      default: scope => {
        if (!scope.row.edit) return <span>{scope.row.cost}</span>
  
        return (
          <el-input
            data-name="cost"
            value={this.editInput.cost}
            onInput={this.handleEidtChange({name: 'cost'})}
            size="mini" />
        )
      }
    }
    const countSlot = {
      default: scope => {
        if (!scope.row.edit) return <span>{scope.row.count}</span>
  
        return (
          <el-input
            value={this.editInput.count}
            onInput={this.handleEidtChange({name: 'count'})}
            size="mini" />
        )
      }
    }
    const upLimitSlot = {
      default: scope => {
        if (!scope.row.edit) return <span>{scope.row.upLimit}</span>
  
        return (
          <el-input
            value={this.editInput.upLimit}
            onInput={this.handleEidtChange({name: 'upLimit'})}
            size="mini" />
        )
      }
    }
    const downLimitSlot = {
      default: scope => {
        if (!scope.row.edit) return <span>{scope.row.downLimit}</span>
  
        return (
          <el-input
            value={this.editInput.downLimit}
            onInput={this.handleEidtChange({name: 'downLimit'})}
            size="mini" />
        )
      }
    }
    const chartSlot = {
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
          return <peity type={setPeity.type} options={setPeity.options} data={scope.row.lineData}></peity>
        }
      }
    }
    const operatingSlot = {
      default: scope => {
        return [
          <el-button onClick={this.handleMoveUp} data-index={scope.$index} disabled={scope.$index === 0} type="text" size="mini">
            上移
          </el-button>,
          <el-button onClick={this.handleMoveDown} data-index={scope.$index} disabled={scope.$index + 1 === Object.keys(this.localStocks).length} type="text" size="mini">
            下移
          </el-button>,
          <el-button onClick={this.handleClickEditRowBtn} data-code={scope.row.code} type="text" size="mini">
            { scope.row.edit ? '完成' : '编辑' }
          </el-button>,
          <el-button onClick={this.handleClickDeleteRowBtn} data-code={scope.row.code} type="text" size="mini">
            移除
          </el-button>
        ]
      }
    }
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
          <el-table-column key='股票'  label="股票" scopedSlots={nameSlot} />
          <el-table-column key='现价' width="50" prop="curPrice" label="现价" formatter={this.formatterFixedTwo} sortable={!this.setModeChecked} />
          <el-table-column key='涨跌幅' width="70" prop="range" label="涨跌幅" formatter={this.formatter} sortable={!this.setModeChecked} />>
          <el-table-column key='涨跌额' width="70" prop="rangePrice" label="涨跌额" formatter={this.formatterFixedTwo} sortable={!this.setModeChecked} />
          {
            shouldRender('toPrice') && (
              <el-table-column key='今开' width="45" prop="toPrice" label="今开" formatter={this.formatterFixedTwo}  />
            )
          }
          {
            shouldRender('highPrice') && (
              <el-table-column key='最高' width="45" prop="highPrice" label="最高" formatter={this.formatterFixedTwo}  />
            )
          }
          {
            shouldRender('lowPrice') && (
              <el-table-column key='最低' width="45" prop="lowPrice" label="最低" formatter={this.formatterFixedTwo}  />
            )
          }
          {
            shouldRender('profit') && (
              <el-table-column key='盈亏' width="50" prop="profit" label="盈亏" formatter={this.formatterFixedTwo} sortable={!this.setModeChecked}  />
            )
          }
          {
            setModeCheckedShouldRender('cost') && (
              <el-table-column key='成本' width="50" label="成本" scopedSlots={costSlot} />
            )
          }
          {
            setModeCheckedShouldRender('count') && (
              <el-table-column key='持仓' width="50" label="持仓" scopedSlots={countSlot} />
            )
          }
          {
            this.setModeChecked && (
              <el-table-column key='上限' width="50" label="上限" scopedSlots={upLimitSlot} />
            )
          }
          {
            this.setModeChecked && (
              <el-table-column key='下限' width="50" label="下限" scopedSlots={downLimitSlot} />
            )
          }
          {
            shouldRender('chart') && (
              <el-table-column key='走势图' width="50" label="走势图" scopedSlots={chartSlot} />
            )
          }
          {
            this.setModeChecked && (
              <el-table-column key='操作' width="145" label="操作" fixed="right" scopedSlots={operatingSlot} />
            )
          }
        </el-table> 
      </div >
    )
  }
}

const FormContent = {
  props: ['formInline', 'localStocks'],
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
      if (Object.keys(this.localStocks).includes(value.slice(-8))) {
        callback(new Error('股票已存在，请勿重复添加！'))
      } else {
        callback()
      }
    }
    return {
      formRules: {
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
          return this.$emit('addStock')
        }
      })
    },
    querySearch(queryString, cb) {
      const createFilter = queryString => {
        return restaurant => checkAllow(restaurant.value.slice(-6))
      }
      getStockBySuggest(queryString).then(res => {
        let suggestList = getSuggestList(res)
        let result = queryString
          ? suggestList.filter(createFilter(queryString))
          : suggestList
        cb(result)
      })
    }
  },
  render(h) {
    const {cost, code, count} = this.formInline
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
            value={code} 
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
            value={cost}
            placeholder="请输入持仓成本"
            clearable />
        </el-form-item>
        <br />
        <el-form-item label="持股量">
          <el-input
            onInput={this.handleFormInlineChange('count')}
            value={count}
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
          style={{
            width: this.announcementWidth + 'px',
            overflow: 'hidden',
            marginTop: '10px'
          }}
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

const getLocalStorageObject = name => JSON.parse(localStorage.getItem(name))
const setLocalStorageObject = (name, object) => localStorage.setItem(name, JSON.stringify(object))

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
      editInput: {
        count: 0,
        cost: 0,
        upLimit: 0,
        downLimit: 0
      },
      stocksLoaded: false,
      progress: 0,
      announcements: [],
      colList: [], // 设置显示项
      setModeChecked: false, // 打开设置状态
      stocksDetail: {}, // 股票列表
      localSortedStockCodeList: getLocalStorageObject('localSortedStockCodeList') || [], // 股票名称列表
      suggests: [],
      localStocks: [],
      stockList: [],
      formInline: initFormInlineData()
    }
  },
  loadingMsg: '数据加载中...',
  computed: {
    announcementWidth() {
      return this.stockWidth - ANNOUNCEMENTPADDING
    },
    sortStocks() {
      return Object.values(this.stocksDetail).sort((a, b) =>
          this.localSortedStockCodeList.indexOf(a.code) - this.localSortedStockCodeList.indexOf(b.code)
      )
    },
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
    localSortedStockCodeList(val) {
      setLocalStorageObject('localSortedStockCodeList', val)
    },
    colList(val) {
      setLocalStorageObject('colList', val)
    },
    localStocks: {
      handler(val) {
        setLocalStorageObject('localStocks', val)
      },
      deep: true
    },
    setModeChecked(val) {
      if (val) {
        this.$refs.mainContent.clearSort()
      }
      
      // this.$nextTick(() => {
      //   const stocksDetailCopy = Utils.deepClone(this.stocksDetail)

      //   Object.entries(this.stocksDetailCopy).forEach((code, stockItem) => {
      //     stocksDetailCopy[code] = Object.assign({}, stockItem, {
      //       setModeChecked: this.setModeChecked
      //     })
      //   })
        
      // })
    }
  },
  created() {
    this._initGetStock()
    this.setAnnouncement()

    // 获取走势图
    this.$nextTick(async () => {
      await Promise.all(Object.values(this.localStocks).map(stock => {
        this._getStockByCode(stock)
      }))
      this.stocksLoaded = true
      await Promise.all(Object.values(this.localStocks).map(({code}) => {
        this._getStockTrade(code)
      }))
  
      // 获得股票数据, 每 10s 更新一次。打开设置的时候不更新
      setInterval(() => {
        if (!this.setModeChecked) {
          Object.values(this.localStocks).forEach(stock => {
            this._getStockByCode(stock)
          })
        }
      }, 10000)
      
      // 进度条
      setInterval(() => {
        this._progressIncrease()
      }, 100)
    })
  },
  methods: {
    _getStockTrade(code) {
      if (!code) return false

      getStockTrade(code).then(res => {
        const tradeData = getStockTradeDetail(res) || {}
        const stockItem = Utils.deepClone(this.stocksDetail[code]) || {}
        stockItem.lineData = tradeData.toString()
        this.stocksDetail = Object.assign({}, this.stocksDetail, { [code]: stockItem })
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
      // const initColList = ['profit', 'chart', 'cost']

      const colList = getLocalStorageObject('colList') || []
      this.colList = colList.length ? colList : initColList
      
      const localStocks = getLocalStorageObject('localStocks') || {}

      this.localStocks = JSON.stringify(localStocks) !== '{}' ? localStocks : initShock
      
    },
    _getStockByCode({ code, cost = 0, count = 0, upLimit = 0, downLimit = 0 } = {}) {
      return new Promise(async (resolve, reject) => {
        
        if (!code) return reject(new Error('code is null'))
      
        const res = await getStockByCode(code) // axios return null or Object
        // 数据清洗
        const stockDetail = getStockDetail({res, code, cost, count})
  
        if (!stockDetail) return reject(new Error('stockDetail is null'))
  

        const item = Utils.deepClone(this.stocksDetail[code]) || {}
  
        stockDetail['lineData'] = item['lineData'] || ''
        if (!this.localSortedStockCodeList.includes(code)) {
          this.localSortedStockCodeList.push(code)
        }
        stockDetail.upLimit = upLimit
        stockDetail.downLimit = downLimit
        this.stocksDetail = Object.assign({}, this.stocksDetail, {
          [code]: stockDetail
        })
  
        this.localStocks = Object.assign({}, this.localStocks, {
          [code]: { code, cost, count, upLimit, downLimit }
        })

        resolve(code)
      })
    },
    setAnnouncement(limit = 20) {
      getAnnouncement(limit).then(res => {
        this.announcements = getAnnouncementDetail(res)
      })
    },
    _progressIncrease() {
      this.progress = (this.progress + 1) % 101
    },
    handleFormInlineChange({ key, value }) {
      this.formInline = Object.assign({}, this.formInline, {
        [key]: value
      })
    },
    handleFormInlineSelect({ value }) {
      this.handleFormInlineChange({key: 'code', value})
    },
    async handleAdddStock() {
      let code = this.formInline.code.slice(-8)
      let { cost, count } = this.formInline
      cost = cost ? cost : 0
      count = count ? count : 0
      
      await this._getStockByCode({code, cost, count})
      this._getStockTrade(code)
      this.formInline = initFormInlineData()
    },
    hadnleSetModeChecked(val) {
      this.setModeChecked = val
    },
    handleEditRow(code) {
      const stockItem = Utils.deepClone(this.stocksDetail[code])
      
      if (!stockItem.edit) {
        this.editInput = {
          cost: stockItem.cost,
          count: stockItem.count,
          upLimit: stockItem.upLimit,
          downLimit: stockItem.downLimit
        }
      } else {
        stockItem.cost = this.editInput.cost
        stockItem.count = this.editInput.count
        stockItem.upLimit = this.editInput.upLimit
        stockItem.downLimit = this.editInput.downLimit

        const localStock = Utils.deepClone(this.localStocks[code])
        localStock.cost = this.editInput.cost
        localStock.count = this.editInput.count
        localStock.upLimit = this.editInput.upLimit
        localStock.downLimit = this.editInput.downLimit
        
        this.localStocks = Object.assign({}, this.localStocks, {
          [code]: localStock
        })
        
      }

      stockItem.edit = !stockItem.edit
      this.stocksDetail = Object.assign({}, this.stocksDetail, {
        [code]: stockItem
      })
    },
    handleEditChange({name, value}) {
      this.editInput = Object.assign(this.editInput, {
        [name]: value
      })
    },
    handleDeleteRow(code) {
      const stocksDetail = Utils.deepClone(this.stocksDetail)
      const localStocks = Utils.deepClone(this.localStocks)
      delete stocksDetail[code]
      delete localStocks[code]

      this.localSortedStockCodeList = this.localSortedStockCodeList.filter(d => d !== code)
      this.stocksDetail = stocksDetail
      this.localStocks = localStocks
    },
    handleCheckboxChange(val) {
      this.colList = val
    },
    handleMoveDown(index) {
      const i = +index
      const list = [...this.localSortedStockCodeList.filter(d => Object.keys(this.localStocks).includes(d))];
      [list[i+1], list[i]] = [list[i], list[i+1]]
      
      this.localSortedStockCodeList = list
    },
    handleMoveUp(index) {
      const i = +index
      const list = [...this.localSortedStockCodeList.filter(d => Object.keys(this.localStocks).includes(d))];
      [list[i], list[i - 1]] = [list[i - 1], list[i]]
      this.localSortedStockCodeList = list
    }
  },
  render (h) {
    return (
      <div class="stock" ref="stock">
        <div class={{ 'setMode-main': this.setModeChecked, main: true }}>
          {
            !this.stocksDetail && this.stocksLoaded ? (
              <loading-content>{this.$options.loadingMsg}</loading-content>
            ) : (
              <main-content
                ref='mainContent'
                setModeChecked={this.setModeChecked}
                colList={this.colList}
                localStocks={this.localStocks}
                sortStocks={this.sortStocks}
                editInput={this.editInput}
                onEditRow={this.handleEditRow}
                onEditChange={this.handleEditChange}
                onDeleteRow={this.handleDeleteRow}
                onMoveDown={this.handleMoveDown}
                onMoveUp={this.handleMoveUp}
                colList={this.colList} />
            )
          }
        </div>
        <div class={{ 'setMode-footer': this.setModeChecked, footer: true }}>
          {
            this.setModeChecked && [
              <form-content
                localStocks={this.localStocks}
                formInline={this.formInline}
                onSelect={this.handleFormInlineSelect}
                onAddStock={this.handleAdddStock}
                onFormInlineChange={this.handleFormInlineChange}
              />,
              <check-box-group
                colList={this.colList}
                onCheckboxChange={this.handleCheckboxChange}
              />
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
