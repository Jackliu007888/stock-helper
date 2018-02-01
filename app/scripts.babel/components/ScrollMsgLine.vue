<template>
  <vue-seamless-scroll :data="data" :class-option="optionLeft" class="seamless-warp">
    <ul class="item">
      <li v-for="item in data"><img src="images/bulb.png" /><span>{{ item.content }}</span></li>
    </ul>
  </vue-seamless-scroll>
</template>

<script>
import vueSeamless from 'vue-seamless-scroll';

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
      
    }
  },
  mounted() {

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
  watch: {
    data() {

    }
  },
  methods: {

  },
  components: {
    vueSeamless
  }
}
</script>

<style scoped>
.seamless-warp {
  overflow: hidden;
  height: 25px;
}

.seamless-warp ul {
  width: 99999px;
}

.seamless-warp ul li {
  float: left;
  list-style: none;
  margin-right: 10px;
}

.seamless-warp ul li span {
  display: inline-block;
  margin-top: -10px;
}

.seamless-warp ul img {
  height: 18px;
  overflow: hidden;
}
</style>