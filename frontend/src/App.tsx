import type { CSSProperties } from 'react'
import HologramViewer from './components/HologramViewer/HologramViewer'
import Header from './components/Header/Header'
import ModelControls from './components/ModelControls/ModelControls'
import GestureController from './components/GestureController/GestureController'
import GestureStatus from './components/GestureStatus/GestureStatus'
import MotionDebug from './components/MotionDebug/MotionDebug'
import ComponentTree from './components/ComponentTree/ComponentTree'
import HandCursor from './components/HandCursor/HandCursor'
import ExplodedView from './components/ExplodedView/ExplodedView'
import UploadPanel from './components/UploadPanel/UploadPanel'
import VoiceControl from './components/VoiceControl/VoiceControl'
import LoadingOverlay from './components/ui/LoadingOverlay'

// Columns let clicks pass through the gaps between panels to the 3D view.
const column = (side: 'left' | 'right'): CSSProperties => ({
  position: 'absolute',
  top: 60,
  bottom: 12,
  [side]: 12,
  width: 290,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  overflowY: 'auto',
  pointerEvents: 'none',
})

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <HologramViewer />
      <Header />

      <aside style={column('left')}>
        <UploadPanel />
        <ModelControls />
        <ExplodedView />
        <VoiceControl />
      </aside>

      <aside style={column('right')}>
        <GestureController />
        <GestureStatus />
        <ComponentTree />
        <MotionDebug />
      </aside>

      <HandCursor />
      <LoadingOverlay />
    </div>
  )
}
