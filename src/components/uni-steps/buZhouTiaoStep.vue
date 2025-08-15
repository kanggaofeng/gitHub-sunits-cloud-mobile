<template>
  <view class="buZhouTiaoStep">
    <block v-for="(stepItem, ind) in buZhouTiaoData" :key="ind">
      <!-- {{stepItem}}11 -->
      <div :class="['buList', stepItem.statusCls]">
        <div
          :class="[
            'b-title',
            false ? 'actOpen' : '',
            stepItem.isOpen == 1 &&
            stepItem.activityRecordId != '-1' &&
            stepItem.activityRecordId !== '0' &&
            stepItem.activityRecordId != '1' &&
            stepItem.type != 6 &&
            stepItem.type != 7
              ? ''
              : '',
          ]"
          @click="togStepAct(ind)"
        >
          <div class="circle"></div>
          <div class="title-info">
            <div class="titText">{{ stepItem.nodeName }}</div>
            <!-- <div class="dangQianHuanJie" v-if="stepItem.statusCls == 'newHuanJie'">(当前环节)</div> -->
          </div>
        </div>
        <div class="titTime">{{ stepItem.operationDate }} {{ stepItem.operationTime }} {{ stepItem.operatorName }}({{ stepItem.operator }})</div>
        <div class="liJinTime" v-if="stepItem.isLess1Min">!历经不到{{ stepItem.isLess1Min }}分</div>
        <div class="leftLine" v-if="ind !== buZhouTiaoData.length - 1"></div>
      </div>
    </block>
  </view>
</template>

<script>
export default {
  name: 'UniDrawer',
  props: {
    /**
     * 显示模式（左、右），只在初始化生效
     */
    buZhouTiaoData: {
      type: Array,
    },
    stepWaiInd: {
      type: Number,
    },
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    togStepAct(ind) {
      this.$emit('togStepAct', this.stepWaiInd, ind, this.buZhouTiaoData)
    },
    uPriewImgSingle(dataImg, imgIndex) {
      //console.log(dataImg, 'dataImgdataImg');
      var url = ''
      if (dataImg.ossUrl) {
        url = dataImg.ossUrl
      } else {
        // 怕分享的时候 没有sign
        let a = ''
        if (this.signVal) {
          a = this.signVa
        } else {
          a = this.$store.sign
        }
        url = this.$api.___GAPI_URLe + this.$api.DS_API_INC_SERVER_URL + '/' + dataImg.id + '/' + a
      }
      uni.previewImage({
        current: imgIndex,
        urls: [url],
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.buZhouTiaoStep {
  min-height: 100%;
  padding: 0 15px;
  box-sizing: border-box;
  .buList {
    padding-left: 21px;
    position: relative;
    min-height: 45px;
    &:nth-child(1) {
      margin-top: 0;
    }
    &:last-child {
      min-height: auto;
    }

    .leftLine {
      position: absolute;
      width: 1px;
      background: rgb(235, 237, 240);
      z-index: 1;
      left: 3px;
      top: 25px;
      bottom: 0;
    }
    /* #ifdef MP-WEIXIN */
    .leftLine {
      left: 5px;
    }
    /* #endif */
  }
  .b-container {
    background: #f5f6fa;
    padding: 13px 15px;
    border-radius: 5px;
    box-sizing: border-box;
    margin-top: 10px;
    .b-conent {
      display: flex;
      margin-top: 3px;
      .b-left {
        font-size: 14px;
        font-weight: 400;
        color: #999999;
        width: auto;
        min-width: 60px;
      }
      .b-rig {
        font-size: 14px;
        font-weight: 400;
        color: #333333;
        margin-left: 4px;
      }
    }
  }
  .b-title {
    font-size: 13px;
    font-family:
      PingFangSC-Medium,
      PingFang SC;
    font-weight: 500;
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;

    .circle {
      display: block;
      width: 5px;
      height: 5px;
      border-radius: 100%;
      position: absolute;
      top: 0;
      bottom: 0;
      left: -20px;
      margin: auto;
      z-index: 2;
    }
  }
  .normal {
    color: #323232;
    .circle {
      border: 2px solid #dce1ee;
    }
  }
  .actOpen {
    .circle {
      width: 12px;
      height: 12px;
      border-radius: 100%;
      border: 2px solid #5d8afc;
      background: white;
      left: -23px;
    }
  }
  .newHuanJie {
    color: #2699fb;
    .circle {
      border: 2px solid #5d8afc;
      background: #5d8afc;
    }
    .dangQianHuanJie {
      color: #5d8afc;
      font-size: 12px;
      margin-left: 5px;
      font-size: 12px;
    }
  }
}
.b-title {
  display: flex;
  align-items: center;
}
.titTime {
  white-space: normal;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  color: rgb(153, 153, 153);
  font-size: 13px;
  font-weight: 600;
  padding-top: 3px;
  padding-bottom: 5px;
  box-sizing: border-box;
}
.liJinTime {
  text-align: right;
  width: 100%;
  -webkit-transform: scale(0.7, 0.8);
  -moz-transform: scale(0.7, 0.8);
  -o-transform: scale(0.7, 0.8);
  transform: scale(0.7, 0.8);
  color: #f94d3a;
  font-size: 14px;
  position: relative;
  left: 40px;
}
.isHasSelect::after {
  font-family: iconfont;
  content: '\e629';
  position: absolute;
  right: 0;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 17px;
  color: blue;
}
.titText {
  min-width: 80px;
  height: 30px;
  line-height: 30px;
  white-space: nowrap;
}
.actOpen::after {
  font-family: iconfont;
  content: '\e638';
  position: absolute;
  right: 0;
  top: 50%;
  color: blue;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 17px;
}
.allFile {
  margin: 3px 0;
  border-radius: 8px;
  width: 100%;
  .file-wrap {
    display: flex;
    background: rgba(255, 255, 255, 1);
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    box-sizing: border-box;
    width: 100%;
    .file-left {
      width: 40px;
      height: 40px;
      background: white;
      text-align: center;
      .imgLeft {
        width: 40px;
        height: 40px;
        border-radius: 5px;
      }
      .iconwendang {
        width: 100%;
        height: 100%;
        font-size: 23px;
      }
    }
    .file-rig {
      flex: 1;
      padding-left: 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      .fileName {
        display: inline-block;
        font-size: 13px;
        font-weight: 500;
        color: rgba(51, 51, 51, 1);
      }
      .chakan {
        display: inline-block;
        .fileSize {
          margin-right: 10px;
          font-size: 13px;
          font-weight: 500;
          font-weight: bold;
          color: rgba(171, 178, 188, 1);
        }
        .chaKan {
          font-size: 13px;
          font-weight: 500;
          color: #abb2bc;
        }
      }
    }

    .delImg {
      width: 20px;
      height: 20px;
    }
  }
  .allFileList {
    width: 100%;
    height: auto;
    .allImg {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }
  }
}
</style>
