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
  data() {
    return {
      translateX: -20
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
  created() {
    let i = 0
    const addTranslateX = () => {
      if (i++ >80 && i % 80 === 0) {
        this.translateX+= 20
      }
      window.requestAnimationFrame(addTranslateX)    
    }
    window.requestAnimationFrame(addTranslateX)
  },
  render(h) {
    return (
      <ul class="item" style={{ transform: `translate3d(0, -${this.translateX}px, 0)`, transition: 'all 0.2s ease-in 0s', overflow: 'hidden'}}>
        {
          this.data.map(item => (
            <li style={{
              textAlign: 'left',
              fontSize: '16px',
              lineHeight: '20px'
            }} key={item.content}><img style={{ width: '20px' }} src="images/bulb.png" /><span>{item.content}</span></li>
          ))
        }
      </ul>
    )
  }
}
