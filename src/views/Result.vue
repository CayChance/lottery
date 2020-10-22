<template>
  <div class="about">
    <div class="result">
      <div v-for="(value,key) in allWinnerList" :key="key">
        <h3 class="lottery-title">{{config[key]}}</h3>
        <ul v-show="value.length" class="result-wrapper">
          <li v-for="(item,index) in value" :key="index" class="result-single">
            <span>{{item.name}}</span>
            <span>{{item.no}}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Result',
  data(){
    return {
      allWinnerList: JSON.parse(localStorage.getItem('allWinnerList'))|| {},
      config: JSON.parse(this.$route.query.config)
    }
  },
  methods: {},
  created(){
    console.log(this.config)
  }
}
</script>
<style scoped>
.about {
  min-width: 100vw;
  min-height: 100vh;
  background-image: url("../assets/img/icon-wall.jpg");
  overflow: hidden;
  background-color: #121936;
  background-size: 100% 100% ;
  background-position: center center;
  background-repeat: no-repeat;
}
.lottery-title {
  font-size: 38px;
  color: #fff;
  margin-top: 10px;
  margin-bottom: 30px;
}
.result-single {
  display: inline-block;
  font-size: 26px;
  font-weight: 800;
  width: 140px;
  color: #fff;
  margin: 5px;
  border-radius: 10px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.8);
  padding: 7px 0;
  background-color: red;
}
</style>
