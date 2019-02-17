import Peity from './lib/peity'

const types = ['line', 'bar', 'pie', 'donut']

export default {
  props: {
    type: {
      type: String,
      required: true,
      validator: value => types.indexOf(value) > -1
    },
    data: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      chart: null
    }
  },
  mounted () {
    // console.log(this.$el.parentNode)
    this.chart = new Peity(this.$refs.span, this.type, this.data, this.options)
    this.chart.draw()
  },
  watch: {
    data (val) {
      this.$nextTick(() => {
        this.chart.raw = val
        this.chart.draw()
      })
    }
  },
  beforeDestroy () {
    this.chart.destroy()
  },
  render(h) {
    return (
      <div class="peity"><span ref="span"></span></div>
    )
  }
}
