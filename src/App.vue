<template>
  <div>
    <ScoreBoard/> 
    <MainBody/>
  </div>
</template>

<script>
//引入计分板
import ScoreBoard from './components/ScoreBoard'
//引入主体区域
import MainBody from './components/MainBody'
//引入需要的 API
import {} from 'vue'

export default {
  name: 'App',
  components: {
    ScoreBoard,
    MainBody
  }
}
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    /* background: black; */
  }

  li {
    user-select: none;
    list-style: none;
  }
</style>