// 秒杀间隔
let intervalTime = 50
chrome.storage.local.get('intervalTime', val => {
  intervalTime = val.intervalTime || 50
})

// 抢购时间
let buyTime = '2021-01-20T20:00'
chrome.storage.local.get('buyTime', val => {
  buyTime = val.buyTime || '2021-01-20T20:00'
})

// 定时器
let timer = undefined
let settleTimer = undefined
let submitTimer = undefined
// 结算状态
let settleStatus = false
// 提交状态
let submitStatus = false

function dateFormat(fmt, date) {
  let ret
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  }
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt)
    if (ret) {
        fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    }
  }
  return fmt
}

/**
 * 结算
 */
let settleFun = () => {
  settleStatus = true

  settleTimer = setInterval(() => {
    let go_button = document.getElementById('J_Go')
    if (go_button && go_button.className.indexOf('submit-btn-disabled') === -1) {
      console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 开始抢购`)
      clearInterval(settleTimer)
      go_button.click()
    } else {
      console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 购物车中未选择商品 无法抢购`)
    }
  }, 10)
}

/**
 * 提交
 */
let submitFun = () => {
  submitStatus = true

  let submitTimer = setInterval(() => {
    let submit_button = document.querySelector(".go-btn")
    if (submit_button) {
      console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 开始结算`)
      clearInterval(submitTimer)
      submit_button.click()
    } else {
      console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 很遗憾没抢到`)
      clearInterval(submitTimer)
    }
  }, 10)
}

/**
 * 主入口
 */
let main = () => {
  let startTime = new Date(buyTime).getTime()
  let nowTime = new Date().getTime()
  if (nowTime > startTime) {
    let href = window.location.href
    // 判断当前所在页面
    if (href.indexOf('cart') !== -1) {
      // 购物车
      if (settleStatus === false) {
        console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 准备抢购`)
        settleFun()
      }
    } else if (href.indexOf('buy') !== -1) {
      // 结算
      if (submitStatus === false) {
        console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 准备结算`)
        submitFun()
      }
    }
  } else {
    console.log(`当前时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date())} 抢购时间为：${dateFormat('YYYY-mm-dd HH:MM:SS', new Date(buyTime))} 还没到时间`)
  }
}

/**
 * 运行
 */
let run = () => {
  timer = setInterval(() => {
    main()
  }, intervalTime)
}

$('body').append(
  `<div id="helper-setting-button">
    <div>抢购设置</div>
  </div>`
)

$('#helper-setting-button').click(() => {
  $('body').append(
    `<div id="helper-setting">
      <div class="helper-setting-form">
        <div class="helper-setting-form-title">抢购设置</div>
        <div class="helper-setting-form-item">
          <label>秒杀间隔：</label>
          <input id="helper-setting-interval" class="helper-setting-form-item-interval" value="${intervalTime}"/>
          <label>（单位：毫秒）</label>
        </div>
        <div class="helper-setting-form-item">
          <label>抢购时间：</label>
          <input id="helper-setting-time" type="datetime-local" value="${buyTime}"/>
        </div>
        <div class="helper-setting-form-item">
          <div id="helper-setting-save-button" class="helper-setting-form-item-button">保存</div>
          <div id="helper-setting-cancel-button" class="helper-setting-form-item-button">取消</div>
        </div>
      </div>
    </div>`
  )

  // 保存按钮
  $('#helper-setting-save-button').click(() => {
    clearInterval(timer)
    clearInterval(settleTimer)
    clearInterval(submitTimer)
    intervalTime = $('#helper-setting-interval').val()
    chrome.storage.local.set({ 'intervalTime': intervalTime })
    buyTime = $('#helper-setting-time').val()
    chrome.storage.local.set({'buyTime': buyTime })
    $('#helper-setting').remove()
    run()
  })
  
  // 取消按钮
  $('#helper-setting-cancel-button').click(() => {
    $('#helper-setting').remove()
  })
})

run()
