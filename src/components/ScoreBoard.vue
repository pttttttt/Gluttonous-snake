<template>
  <div class="minutes">
    <h1>本局得分：{{store.state.thisBranch}}</h1>
    <h1>历史最高：{{store.state.historyBranch}}</h1>
  </div>
</template>

<script>
import {useStore} from 'vuex'
export default {
  name: 'ScoreBoard',
  setup() {
    const store = useStore()
    return {
      store
    }
  }
}
</script>

<style scoped>
  .minutes {
    width: 500px;
    height: 0;
    margin: 0 auto;
  }

  .minutes h1 {
    font-size: 30px;
    font-weight: 400;
    /* color: white; */
  }
</style>
