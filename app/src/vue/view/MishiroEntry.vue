<template>
<div id="entry" @click.stop="enter">
  <img :class="{
    yoko: bg,
    tate: !bg
  }" :src="coverSrc" />
  <img :src="'../../asset/img.asar/touch_base.png'" class="touch" id="touchBase" />
  <img :src="'../../asset/img.asar/touch.png'" id="touch" class="touch twinkle" :class="{ active: isTouched }" />
  <button id="entryOptionBtn" class="cgss-btn-lg cgss-btn-lg-ok" @click.stop="showOption($event.target)">{{$t("menu.option")}}</button>
</div>
</template>

<script lang="ts" src="../../ts/renderer/mishiro-entry.ts">
</script>

<style>
#entry{
  position: absolute;
  z-index: 1000;
}
#entryOptionBtn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1001;
}
.touch{
  z-index: 1000;
  position: fixed;
  left: 50%;
  top: 90%;
}
#touch{
  margin-top: -17px;
  margin-left: -150px;
}
#touchBase{
  margin-top: -25px;
  margin-left: -264px;
}
.twinkle{
  animation:twinkle 1.6s linear infinite;
}
.twinkle.active{
  animation:twinkle 0.2s linear infinite;
}
/* .out{
  animation:out 0.2s linear;
} */

@keyframes twinkle{
  0%   {opacity: 1;}
  50%  {opacity: 0.5;}
  100% {opacity: 1;}
}

/* @keyframes out{
  0%   {opacity: 1;}
  100% {opacity: 0;}
} */

</style>
