import HologramViewer from './components/HologramViewer/HologramViewer'
import ModelControls from './components/ModelControls/ModelControls'
import GestureController from './components/GestureController/GestureController'
import GestureStatus from './components/GestureStatus/GestureStatus'
import MotionDebug from './components/MotionDebug/MotionDebug'
import ComponentTree from './components/ComponentTree/ComponentTree'
import HandCursor from './components/HandCursor/HandCursor'
import ExplodedView from './components/ExplodedView/ExplodedView'
import UploadPanel from './components/UploadPanel/UploadPanel'

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <HologramViewer />
      <ModelControls />
      <GestureController />
      <GestureStatus />
      <MotionDebug />
      <ComponentTree />
      <HandCursor />
      <ExplodedView />
      <UploadPanel />
    </div>
  )
}