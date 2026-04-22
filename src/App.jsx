import { useState } from 'react'
import { useToast } from './components/Toast'
import './App.css'

function App() {
  const { toast, success, error, warning, info, dismiss } = useToast()
  const [count, setCount] = useState(0)

  const handleToast = () => {
    toast('这是一条默认通知消息', {
      duration: 3000,
      position: 'top-right'
    })
  }

  const handleSuccess = () => {
    success('操作成功！您的请求已完成', {
      duration: 3000,
      position: 'top-right'
    })
  }

  const handleError = () => {
    error('操作失败！请稍后重试', {
      duration: 5000,
      position: 'top-right'
    })
  }

  const handleWarning = () => {
    warning('警告！此操作可能产生不可逆影响', {
      duration: 4000,
      position: 'top-right'
    })
  }

  const handleInfo = () => {
    info('提示：您可以点击关闭按钮手动关闭通知', {
      duration: 3000,
      position: 'top-right'
    })
  }

  const handleStacked = () => {
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        success(`堆叠通知 ${i}：自动堆叠功能正常工作`, {
          duration: 5000,
          position: 'top-right'
        })
      }, i * 200)
    }
  }

  const handleDifferentPositions = () => {
    success('右上角通知', { position: 'top-right', duration: 5000 })
    setTimeout(() => {
      info('左上角通知', { position: 'top-left', duration: 5000 })
    }, 300)
    setTimeout(() => {
      warning('顶部中央通知', { position: 'top-center', duration: 5000 })
    }, 600)
    setTimeout(() => {
      error('右下角通知', { position: 'bottom-right', duration: 5000 })
    }, 900)
    setTimeout(() => {
      toast('左下角通知', { position: 'bottom-left', duration: 5000, type: 'info' })
    }, 1200)
    setTimeout(() => {
      success('底部中央通知', { position: 'bottom-center', duration: 5000 })
    }, 1500)
  }

  const handleDismissAll = () => {
    dismiss()
  }

  const handleCustomDuration = () => {
    info('这是一条持久化通知（10秒后自动关闭）', {
      duration: 10000,
      position: 'top-right'
    })
  }

  const handleNoDuration = () => {
    error('这是一条需要手动关闭的通知', {
      duration: 0,
      position: 'top-right'
    })
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <div className="hero-content">
            <h1>Toast 通知系统</h1>
            <p>
              一个功能完善的全局通知组件，支持函数式调用、自动堆叠、
              Portal 渲染（脱离父级 DOM 流）、平滑动画和自动倒计时销毁。
            </p>
          </div>
        </div>
        <div className="demo-section">
          <h2>基础通知类型</h2>
          <div className="button-group">
            <button className="demo-btn default-btn" onClick={handleToast}>
              默认通知
            </button>
            <button className="demo-btn success-btn" onClick={handleSuccess}>
              成功通知
            </button>
            <button className="demo-btn error-btn" onClick={handleError}>
              错误通知
            </button>
            <button className="demo-btn warning-btn" onClick={handleWarning}>
              警告通知
            </button>
            <button className="demo-btn info-btn" onClick={handleInfo}>
              信息通知
            </button>
          </div>
        </div>

        <div className="demo-section">
          <h2>高级功能演示</h2>
          <div className="button-group">
            <button className="demo-btn stack-btn" onClick={handleStacked}>
              自动堆叠演示
            </button>
            <button className="demo-btn position-btn" onClick={handleDifferentPositions}>
              多位置演示
            </button>
            <button className="demo-btn custom-btn" onClick={handleCustomDuration}>
              自定义时长 (10秒)
            </button>
            <button className="demo-btn persistent-btn" onClick={handleNoDuration}>
              持久化通知
            </button>
            <button className="demo-btn dismiss-btn" onClick={handleDismissAll}>
              清除所有通知
            </button>
          </div>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>使用方法</h2>
          <div className="code-block">
            <pre>{`// 在组件中使用
import { useToast } from './components/Toast'

function MyComponent() {
  const { toast, success, error, warning, info, dismiss } = useToast()

  // 基本用法
  toast('消息内容', {
    type: 'success',  // default, success, error, warning, info
    duration: 3000,   // 毫秒，0 表示永久
    position: 'top-right'  // 6 个位置可选
  })

  // 快捷方法
  success('操作成功')
  error('操作失败')
  warning('警告信息')
  info('提示信息')

  // 清除通知
  dismiss(toastId)  // 清除单个
  dismiss()         // 清除全部
}`}</pre>
          </div>
        </div>
        <div id="features">
          <h2>功能特性</h2>
          <ul className="feature-list">
            <li>✅ 函数式调用，使用简单</li>
            <li>✅ 自动堆叠逻辑，支持多条通知</li>
            <li>✅ Portal 渲染，脱离父级 DOM 流</li>
            <li>✅ 平滑的进入/退出动画</li>
            <li>✅ 自动倒计时销毁</li>
            <li>✅ 6 种位置：上左、上中、上右、下左、下中、下右</li>
            <li>✅ 5 种类型：默认、成功、错误、警告、信息</li>
            <li>✅ 支持手动关闭和自动关闭</li>
            <li>✅ 进度条显示剩余时间</li>
            <li>✅ 响应式设计，支持移动端</li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
