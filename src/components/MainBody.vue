<template>
    <section>
        <ul class="snakes">
            <!-- 蛇 头部 -->
            <li 
                class="head" 
                :style="`
                    left: ${snakeHead.x}px;  
                    top: ${snakeHead.y}px; 
                    transform: rotate(${direction}deg); 
                    background-color: ${color}
                `"
            >&gt;</li>
            <!-- 蛇 身体 -->
            <li 
                v-for="coordinate in snakeBody.coordinate" 
                :key="`${coordinate.x}${coordinate.y}`"
                :style="`left: ${coordinate.x}px; top: ${coordinate.y}px;`"
            ></li>
        </ul>
        <ol>
            <!-- 墙体 -->
            <li 
                v-for="coordinate, index in wall" 
                :key="index" 
                :style="`left: ${coordinate.x}px; top: ${coordinate.y}px;`"
            ></li>
        </ol>
        <!-- 遮罩层 -->
        <div class="bg" v-show="suspend">游戏暂停<br/>按下空格键继续</div>
        <div class="bg" v-show="!judges && !suspend">游戏结束<br/>按下空格键重新开始</div>
        <!-- 食物 -->
        <div 
            class="rood"
            :style="`left: ${roodCoordinate.x}px; top: ${roodCoordinate.y}px;`"
        ></div>
        <div>{{ speeds }}</div>
    </section>
</template>

<script>
import {ref, reactive} from 'vue'
import {useStore} from 'vuex'
export default {
  name: 'MainBody',
  setup() {
    // 引入vuex
    const store = useStore()
    // 初始化历史记录
    if (!localStorage.getItem('historyBranch')) localStorage.setItem('historyBranch', 0)
    store.commit('renew')
    // 蛇 速度 代码
    let speed = ref(181)
    // 蛇 速度 显示
    let speeds = ref(4)
    // 定时器id
    let timer
    // 墙体
    const wall = [
        // 顶点
        {x: 70, y: 70},
        {x: 430, y: 70},
        {x: 430, y: 430},
        {x: 70, y: 430},
        // 中心点
        {x: 250, y: 250},
        // 上
        {x: 250, y: 70},
        {x: 250, y: 80},
        {x: 250, y: 90},
        {x: 250, y: 100},
        {x: 250, y: 110},
        {x: 250, y: 120},
        {x: 250, y: 130},
        {x: 250, y: 140},
        {x: 250, y: 150},
        {x: 250, y: 160},
        // 右
        {x: 340, y: 250},
        {x: 350, y: 250},
        {x: 360, y: 250},
        {x: 370, y: 250},
        {x: 380, y: 250},
        {x: 390, y: 250},
        {x: 400, y: 250},
        {x: 410, y: 250},
        {x: 420, y: 250},
        {x: 430, y: 250},
        // 下
        {x: 250, y: 340},
        {x: 250, y: 350},
        {x: 250, y: 360},
        {x: 250, y: 370},
        {x: 250, y: 380},
        {x: 250, y: 390},
        {x: 250, y: 400},
        {x: 250, y: 410},
        {x: 250, y: 420},
        {x: 250, y: 430},
        // 左
        {x: 70, y: 250},
        {x: 80, y: 250},
        {x: 90, y: 250},
        {x: 100, y: 250},
        {x: 110, y: 250},
        {x: 120, y: 250},
        {x: 130, y: 250},
        {x: 140, y: 250},
        {x: 150, y: 250},
        {x: 160, y: 250},
        // 左上
        {x: 160, y: 160},
        {x: 170, y: 170},
        {x: 180, y: 180},
        {x: 190, y: 190},
        {x: 200, y: 200},
        // 右上
        {x: 300, y: 200},
        {x: 310, y: 190},
        {x: 320, y: 180},
        {x: 330, y: 170},
        {x: 340, y: 160},
        // 右下
        {x: 300, y: 300},
        {x: 310, y: 310},
        {x: 320, y: 320},
        {x: 330, y: 330},
        {x: 340, y: 340},
        // 左下
        {x: 160, y: 340},
        {x: 170, y: 330},
        {x: 180, y: 320},
        {x: 190, y: 310},
        {x: 200, y: 300},
    ]
    // 蛇 头部
    const snakeHead = reactive({x: 200, y: 270})
    // 蛇 身体
    let snakeBody = reactive({
        coordinate: [
            {x: 190, y: 270},
            {x: 180, y: 270},
            {x: 170, y: 270},
            {x: 160, y: 270},
            {x: 150, y: 270}
        ]
    })
    // 备份身体初始数据
    const snakeBodyCopy = [
        {x: 190, y: 270},
        {x: 180, y: 270},
        {x: 170, y: 270},
        {x: 160, y: 270},
        {x: 150, y: 270}
    ]
    // 控制头部旋转角度
    let direction = ref(0)
    // 控制蛇头部颜色
    let color = ref('pink')
    // 判断游戏是否结束
    let judges = ref(true)
    // 节流阀 按下加速
    let judgeSpeed = ref(true)
    // 节流阀 移动速度
    let throttle = ref(true)
    // 判断是否手动暂停
    let suspend = ref(false)
    addEventListener('keydown', e => {
        // 清除浏览器按下方向键默认事件
        if (e.key == 'ArrowUp' || e.key == 'ArrowRight' || e.key == 'ArrowDown' || e.key == 'ArrowLeft' || e.key == ' ') e.preventDefault()
        // 加速
        if (judgeSpeed.value && judges.value && !suspend.value) e.key === '0' && speedHandler(2, false)
    })
    // 按下按钮加速 松开减速
    function speedHandler(multiplier, judge) {
        judgeSpeed.value = judge
        let tmpSpeed = speed.value
        for (let i = 0; i < multiplier; i++) {
            tmpSpeed = judge ? tmpSpeed * 1.5 : tmpSpeed / 1.5
        }
        speed.value = tmpSpeed
        speeds.value = judge ? speeds.value - multiplier : speeds.value + multiplier
        clearInterval(timer)
        move()
    }
    // 控制
    addEventListener('keyup', e => {
        // 控制移动速度
        if (throttle.value) { // 节流
            switch (e.key) {
                case '2':
                    speed.value *= 1.5
                    speed.value = speed.value > 600 ? 600 : Math.floor(speed.value)
                    speeds.value = speeds.value <= 1 ? 1 : speeds.value - 1
                    CommonFactors(speed.value + 10)
                    break
                case '1':
                    speed.value /= 1.5
                    speed.value = speed.value < 16 ? 16 : Math.floor(speed.value)
                    speeds.value = speeds.value >= 10 ? 10 : speeds.value + 1
                    CommonFactors(speed.value + 10) 
                    break
                case '.':
                    speed.value = 181
                    speeds.value = 4
                    CommonFactors(600)
                    break
                case '0':
                    if(judges.value && !suspend.value) speedHandler(2, true)
            }
        }
        function CommonFactors(time) {
            clearInterval(timer)
            judges.value && move()
            throttle.value = false
            setTimeout(() => throttle.value = true, time)
        }
        // 控制暂停
        if (e.key == ' ') {
            // 当没失误时按下空格键
            if (judges.value == true && suspend.value == false) {
                judges.value = false
                suspend.value = true
                clearInterval(timer)
            // 当游戏暂停时按下空格键
            } else if (judges.value == false && suspend.value == true) {
                judges.value = true
                suspend.value = false
                move()
            // 当游戏结束时按下暂停键
            } else if (judges.value == false && suspend.value == false) {
                // 重置头部数据
                snakeHead.x = 200
                snakeHead.y = 270
                color.value = 'pink'
                direction.value = 0
                // 重置身体数据
                snakeBody.coordinate = [{},{},{},{},{}]
                snakeBodyCopy.forEach((item, index) => {
                    snakeBody.coordinate[index].x = item.x
                    snakeBody.coordinate[index].y = item.y
                })
                // 重置本局得分
                store.commit('clear')
                // 更新历史得分
                store.commit('renew')
                // 解开按键锁定
                judges.value = true
                // 重启定时器
                move()
            }
        }
        // 控制移动方向
        if (judges.value) {
            switch (e.key) {
                case 'ArrowUp':// 上
                    if (direction.value == 90 || direction.value == 270) break
                    clearInterval(timer)
                    // 头部旋转
                    direction.value = 270
                    // 在头部位置新增一格身体
                    snakeBody.coordinate.unshift({x: snakeHead.x, y: snakeHead.y})
                    // 头部移动
                    snakeHead.y == 0 ? snakeHead.y = 500 : snakeHead.y -= 10
                    CommonFactor()
                    break
                case 'ArrowRight':// 右
                    if (direction.value == 180 || direction.value == 0) break
                    clearInterval(timer)
                    direction.value = 0
                    snakeBody.coordinate.unshift({x: snakeHead.x, y: snakeHead.y})
                    snakeHead.x == 500 ? snakeHead.x = 0 : snakeHead.x += 10
                    CommonFactor()
                    break   
                case 'ArrowDown':// 下
                    if (direction.value == 270 || direction.value == 90) break
                    clearInterval(timer)
                    direction.value = 90
                    snakeBody.coordinate.unshift({x: snakeHead.x, y: snakeHead.y})
                    snakeHead.y == 500 ? snakeHead.y = 0 : snakeHead.y += 10
                    CommonFactor()
                    break
                case 'ArrowLeft':// 左
                    if (direction.value == 0 || direction.value == 180) break
                    clearInterval(timer)
                    direction.value = 180
                    snakeBody.coordinate.unshift({x: snakeHead.x, y: snakeHead.y})
                    snakeHead.x == 0 ? snakeHead.x = 500 : snakeHead.x -= 10
                    CommonFactor()
                    break
            } 
        }
        // 提取公因式 (手动滑稽)
        function CommonFactor() {
            // 判断是否吃到食物
            if (!isRood(snakeHead.x, snakeHead.y)) snakeBody.coordinate.pop()// 移除最后一格身体
            // 判断是否撞到墙或者身体
            if (!gameOver(snakeHead.x, snakeHead.y)) move()
        }
    })
    // 移动
    function move() {
        timer = setInterval(() => {
            switch (direction.value) {
                case 270:// 上
                    // 在头部位置新增一格身体
                    snakeBody.coordinate.unshift({x: snakeHead.x, y: snakeHead.y})
                    // 头部移动
                    snakeHead.y == 0 ? snakeHead.y = 500 : snakeHead.y -= 10
                    break
                case 0:// 右
                    snakeBody.coordinate.unshift({x: snakeHead.x, y: snakeHead.y})
                    snakeHead.x == 500 ? snakeHead.x = 0 : snakeHead.x += 10
                    break
                case 90:// 下
                    snakeBody.coordinate.unshift({x: snakeHead.x, y: snakeHead.y})
                    snakeHead.y == 500 ? snakeHead.y = 0 : snakeHead.y += 10
                    break
                case 180:// 左
                    snakeBody.coordinate.unshift({x: snakeHead.x, y: snakeHead.y})
                    snakeHead.x == 0 ? snakeHead.x = 500 : snakeHead.x -= 10
                    break
            }
            // 判断是否吃到食物
            if (!isRood(snakeHead.x, snakeHead.y)) snakeBody.coordinate.pop()// 移除最后一格身体
            // 判断是否撞到墙或者身体            
            gameOver(snakeHead.x, snakeHead.y)      

            // (废弃代码)
            // let x, y
            // 计算新增身体的位置  
            // y = snakeHead.y == 500 ? 0 : snakeHead.y + 10
            // x = snakeHead.x == 0 ? 500 : snakeHead.x - 10 
            // y = snakeHead.y == 0 ? 500 : snakeHead.y - 10
            // x = snakeHead.x == 500 ? 0 : snakeHead.x + 10 
        }, speed.value)
    }
    judges.value ? move() : clearInterval(timer)
    // 生成食物坐标 声明变量
    let roodCoordinate = reactive(setRoodCoordinate(51))
     // 判断是否吃到食物
     function isRood(x, y) {
        let judge = false
        if (roodCoordinate.x == x && roodCoordinate.y == y) {
            // 调用生成食物坐标函数
            let coordinate = setRoodCoordinate(51)
            // 坐标赋值
            roodCoordinate.x = coordinate.x
            roodCoordinate.y = coordinate.y
            judge = true
            // 加分
            store.commit('addition')
        }
        return judge
     }
     // 判断是否撞到墙或身体
    function gameOver(x, y) {
        let judge = ergodic(x, y)
        // 改变头部颜色 并停止移动
        if (!judge) {
            judges.value = false
            clearInterval(timer)
            color.value = 'red'
        }
        return !judge
    }
    // 生成食物坐标 函数
    function setRoodCoordinate(n) {
        // 随机生成横纵坐标
        let x, y
        x = Math.floor(Math.random() * n) * 10
        y = Math.floor(Math.random() * n) * 10
        // 判断是否生成到了墙体或者身体上
        let judge = ergodic(x, y)
        // 返回坐标
        return !judge ? setRoodCoordinate(n) : {x, y}
    }
    // 遍历身体及墙体数组并判断 (主要作用为 提取公因式)
    function ergodic(x, y) {
        // 此变量用于记录是否已经成功判断到撞墙
        let judge = true
        // 遍历身体数组
        snakeBody.coordinate.forEach(v => {
            if (judge) if (x == v.x && y == v.y) judge = false
        })
        // 遍历墙体数组
        if (judge) {
            wall.forEach(v => {
                if (judge) if (x == v.x && y == v.y) judge = false
            })
        }
        return judge
    }
    // 暴露数据
    return {
      wall,
      snakeHead,
      snakeBody,
      direction,
      color,
      roodCoordinate,
      judges,
      suspend,
      speed,
      speeds
    }
  }
}
</script>

<style scoped>
    section {
        position: relative;
        width: 510px;
        height: 510px;
        margin: 100px auto;
        background: #f1f1f1;
    }

    section .snakes li {
        position: absolute;
        left: 0;
        top: 0;
        width: 10px;
        height: 10px;
        background: pink;
        font-size: 5px;
        line-height: 8px;
    }

    section .snakes .head {
        z-index: 999;
        line-height: 10px;
    }

    section .snakes .head em {
        display: block;
        position: absolute;
        width: 10px;
        height: 10px;
        background: pink;
    }

    section .bg {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1000;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, .3);
        font-size: 40px;
        font-weight: 700;
        line-height: 300px;
        text-align: center;
    }

    section ol li {
        position: absolute;
        width: 10px;
        height: 10px;
        background: rgb(144, 144, 144);
    }

    .rood {
        position: absolute;
        z-index: 500;
        width: 10px;
        height: 10px;
        background: rgb(8, 161, 216);
        border-radius: 50%;
    }
</style>
