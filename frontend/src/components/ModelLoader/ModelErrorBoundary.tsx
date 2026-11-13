import { Component, type ReactNode } from 'react'
import { DEFAULT_MODEL, useModelStore } from '../../store/useModelStore'

type Props = { children: ReactNode }
type State = { failed: boolean }

/**
 * Catches GLB loading errors (404, corrupt file, backend down) so the whole
 * app does not go blank. Shows a message and falls back to the default model.
 */
export default class ModelErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Model failed to load:', error)
    const store = useModelStore.getState()
    const failedName = store.name

    if (store.url !== DEFAULT_MODEL.url) {
      // Switch back to the default model, then show why.
      store.setModel(DEFAULT_MODEL)
      store.setStatus('error', `Could not load "${failedName}". Showing the default model instead.`)
    } else {
      store.setStatus('error', 'Could not load the default model. Check that /models/engine.glb exists.')
    }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
