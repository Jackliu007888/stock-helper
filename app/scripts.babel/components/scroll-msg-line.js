import vueSeamlessScroll from 'vue-seamless-scroll'
import { getColWidth } from '../popup/api/base'

export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    fontSize: {
      type: String,
      default: '12',
      required: false
    }
  },
  computed: {
    optionLeft () {
      return {
        direction: 2,
        limitMoveNum: this.data.length,
        openWatch: true
      }
    },
    displayData () {
      let list = Array();
      this.data.forEach(function(val, idx) {
        list += getColWidth(val);
      });
      return list;
    }
  },
  components: {
    vueSeamlessScroll
  },
  render(h) {
    return (
      <vue-seamless-scroll data={this.data} class-option={this.optionLeft} class="seamless-warp">
        <ul class="item">
          {
            this.data.map(item => (
              <li key={item.content}><img src="images/bulb.png" /><span>{item.content }</span></li>
            ))
          }
        </ul>
      </vue-seamless-scroll>
    )
  }
}
