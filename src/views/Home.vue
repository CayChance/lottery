<template>
  <div class="home">
    <div id="main" :class="{wall:true,mask:showResult}">
      <div class="result-btn">
        <button @click="viewAll">获奖名单</button>
      </div>
    </div>
    <div id="tools" class="tools">
      <button
        v-for="(item,index) in lotteryConfigList"
        @click="onClick(item)"
        class="lottery-button"
        :key="index"
        :class="{ 'clicked': Object.keys(allWinnerList).includes(item.name) }">
        {{ item.text }}
      </button>
      <button
        class="pure-button"
        @click="toggle"
        :class="{ 'button-secondary': !running, 'button-success': running }">
        {{ running ? "停!" : "开始" }}
      </button>
      <button class="pure-button button-warning" @click="back">返回</button>
      <button class="pure-button button-warning" @click="reset">重置</button>
    </div>
    <div v-show="showResult" class="result">
      <h3 class="lottery-title" v-show="!!currentLottery.text">{{currentLottery.text}}</h3>
      <ul v-show="resultList.length" class="result-wrapper">
        <li v-for="(item,index) in resultList" :key="index" class="result-single">
          <span>{{item.name}}</span>
          <span>{{item.no}}</span>
        </li>
      </ul>
    </div>
    <audio id="bgm" class="hide" loop src="./../assets/music/Music.mp3"></audio>
  </div>
</template>

<script>
import "@/utils/tagcanvas.js";
import member from "@/utils/members.js";
const canvas = document.createElement("canvas");

export default {
  name: "Home",
  data() {
    return {
      choosed: JSON.parse(localStorage.getItem("choosed")) || {},
      selected: 0,
      currentLottery: {},
      running: false,
      showResult: false,
      lotteryConfigList: [
        {
          name: 'five',
          text: '五等奖',
          amount: 30
        }, {
          name: 'four',
          text: '四等奖',
          amount: 10
        }, {
          name: 'three',
          text: '三等奖',
          amount: 5
        }, {
          name: 'two',
          text: '二等奖',
          amount: 2
        }, {
          name: 'one',
          text: '一等奖',
          amount: 1
        }
      ],
      resultList: [],
      allWinnerList: JSON.parse(localStorage.getItem('allWinnerList'))|| {},
      bgm: null
    };
  },
  mounted() {
    this.createCanvas();
    if(!this.bgm){
      this.bgm=document.getElementById("bgm");
      this.bgm.volume=1.0;
      this.bgm.currentTime = 0;
    }
  },
  methods: {
    // 查看所有中奖名单
    viewAll(){

      let config = {}
      this.lotteryConfigList.map(item=>{
        config[item.name] = item.text
      })
      this.$router.push({
        name: 'Result',
        query: {
          config: JSON.stringify(config)
        }
      })
    },
    // 返回
    back(){
      this.showResult = false;
    },
    // 播放音乐
    play() {
      this.bgm.play();
    },
    // 暂停音乐
    pause() {
      this.bgm.pause()
    },

    createCanvas() {
      canvas.id = "myCanvas";
      canvas.width = document.body.offsetWidth;
      canvas.height = document.body.offsetHeight;
      document.getElementById("main").appendChild(canvas);

      canvas.innerHTML = this.createHTML();
      window.TagCanvas.Start("myCanvas", "", {
        textColour: null,
        initial: this.speed(),
        dragControl: true,
        textHeight: 14,
        noSelect: true
      });
    },

    createHTML() {
      var html = ["<ul>"];
      member.forEach((item, index) => {
        item.index = index;
        var key = this.getKey(item);
        var color = this.choosed[key] ? "yellow" : "white";
        html.push(
          `<li><a href="#" style="color: ${color};">${item.name}</a></li>`
        );
      });
      html.push("</ul>");
      return html.join("");
    },
    // 初始化速度
    speed() {
      return [0.1 * Math.random() + 0.01, -(0.1 * Math.random() + 0.01)];
    },
    getKey(item) {
      return item.name + "-" + item.no;
    },

    // 重置奖项
    reset: function() {
      if (confirm("确定要重置么？所有之前的抽奖历史将被清除！")) {
        localStorage.clear();
        location.reload(true);
      }
    },

    // 奖项按钮
    onClick: function(item) {
      console.log(item.name,'onclick',Object.keys(this.allWinnerList).includes(item.name));
      if(Object.keys(this.allWinnerList).includes(item.name)) {
        this.selected = 0
      }
      else {
        this.currentLottery = item
        this.showResult = false;
        this.selected = item.amount;
      }
    },
    // 抽奖方法
    lottery(count) {
      console.log(count,'个数');
      var list = canvas.getElementsByTagName("a");
      var color = "yellow";
      var ret = member
        .filter((m, index) => {
          m.index = index;
          return !this.choosed[this.getKey(m)];
        })
        .map(function(m) {
          return Object.assign(
            {
              score: Math.random()
            },
            m
          );
        })
        .sort(function(a, b) {
          return a.score - b.score;
        })
        .slice(0, count)
        .map(m => {
          this.choosed[this.getKey(m)] = 1;
          list[m.index].style.color = color;
          return m.name + ":" + m.no;
        });
      localStorage.setItem("choosed", JSON.stringify(this.choosed));
      return ret;
    },
    // 抽奖/停止抽奖
    toggle: function() {
      if(!this.selected) return confirm("请先选择要抽的奖项")
      this.play()
      if (this.running) {
        window.TagCanvas.SetSpeed("myCanvas", this.speed());
        var ret = this.lottery(this.selected);
        this.selected = 0
        if (ret.length === 0) {
          this.showResult = true;
          return;
          // $("#result")
          //   .css("display", "block")
          //   .html("<span>已抽完</span>");
          // return;
        }
        this.resultList = ret.map(item=>{
          return {
            name: item.split(':')[0],
            no: item.split(':')[1]
          }
        })
        this.showResult = true;
        setTimeout(()=>{
          this.pause()
          window.TagCanvas.Reload("myCanvas");
          const key = this.currentLottery.name
          console.log(key)
          this.allWinnerList[key] = this.resultList
          localStorage.setItem(key, JSON.stringify(this.resultList));
          localStorage.setItem('allWinnerList', JSON.stringify(this.allWinnerList))
        }, 300);
      } else {
        this.showResult = false;
        window.TagCanvas.SetSpeed("myCanvas", [5, 1]);
      }
      this.running = !this.running;
    }
  },
  components: {}
};
</script>
<style lang="scss" scoped>
.result {
  position: absolute;
  height: 320px;
  width: 100%;
  left: 0;
  top: 50%;
  margin-top: -160px;
  text-align: center;
  padding: 10px;
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
.result-single span {
  display: block;
  line-height: 28px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.result-single span:last-child {
  font-size: 16px;
}
button,
input,
optgroup,
select,
textarea {
  color: inherit;
  font: inherit;
  margin: 0;
  border: none;
}
button {
  overflow: visible;
}
button,
select {
  text-transform: none;
}
button,
html input[type="button"],
input[type="reset"],
input[type="submit"] {
  -webkit-appearance: button;
  cursor: pointer;
}
.pure-button {
  display: inline-block;
  zoom: 1;
  line-height: normal;
  white-space: nowrap;
  vertical-align: middle;
  text-align: center;
  cursor: pointer;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
.lottery-button {
  display: block;
  box-sizing: border-box;
  width: 162px;
  margin-top: 10px;
  font-family: inherit;
  font-size: 20px;
  padding: 16px 8px;
  color: rgba(0,0,0,.8);
  border: 0 rgba(0,0,0,0);
  background-color: #fff;
  text-decoration: none;
  border-radius: 6px;
}

.lottery-button:focus {
  background-color: #FA8072;
  outline: 0;
}
.pure-button {
  font-family: inherit;
  font-size: 100%;
  padding: 0.5em 1em;
  color: #444;
  color: rgba(0, 0, 0, 0.8);
  border: 0 rgba(0, 0, 0, 0);
  background-color: #e6e6e6;
  text-decoration: none;
  border-radius: 2px;
}
.pure-button:focus {
  outline: 0;
}
.button-success,
.button-error,
.button-warning,
.button-secondary {
  // color: white;
  border-radius: 4px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}
.button-success {
  background: rgb(28, 184, 65);
}
.button-error {
  background: rgb(202, 60, 60);
}
.button-warning {
  color: white;
  background-color: #800409;
}
.button-secondary {
  background: rgb(66, 184, 221);
}
.tools {
  position: absolute;
  bottom: 20px;
  right: 20px;
  text-align: center;
}
.tools .pure-button {
  display: inline-block;
  margin: 5px;
  padding: 10px 0;
  text-align: center;
  width: 50px;
}
.mask {
  -webkit-filter: blur(5px);
  filter: blur(5px);
}
#main {
  -webkit-transition: all 1s;
  transition: all 1s;
}
.result-btn {
  margin-top: 20px;
  text-align: right;
  margin-right: 30px;
}
.clicked {
  background-color: #b3b3b3 !important;
}
</style>
