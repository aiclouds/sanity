import {
  HotkeyOptions,
  PortableTextBlock,
  PortableTextEditable,
  PortableTextFeatures,
  RenderAnnotationFunction,
  RenderBlockFunction,
  RenderChildFunction,
  RenderDecoratorFunction,
  EditorSelection,
  OnPasteFn,
  OnCopyFn,
  PortableTextEditor
} from '@sanity/portable-text-editor'
import {Marker} from '@sanity/types'
import {FOCUS_TERMINATOR} from '@sanity/util/paths'
import {ScrollContainer} from 'part:@sanity/components/scroll'
import React, {useMemo, useCallback, useEffect, useState} from 'react'
import PatchEvent from '../../PatchEvent'
import styles from './PortableTextInput.css'
import Toolbar from './Toolbar/Toolbar'
import {ExpandCollapseButton} from './expandCollapseButton'
import BlockExtrasOverlay from './BlockExtrasOverlay'
import {RenderBlockActions, RenderCustomMarkers} from './types'
import Decorator from './Text/Decorator'

type Props = {
  initialSelection?: EditorSelection
  isFullscreen: boolean
  markers: Array<Marker>
  hotkeys: HotkeyOptions
  onBlur: () => void
  onCopy?: OnCopyFn
  onFocus: (Path) => void
  onFormBuilderChange: (change: PatchEvent) => void
  onPaste?: OnPasteFn
  onToggleFullscreen: () => void
  portableTextFeatures: PortableTextFeatures
  readOnly: boolean | null
  renderAnnotation: RenderAnnotationFunction
  renderBlock: RenderBlockFunction
  renderBlockActions?: RenderBlockActions
  renderChild: RenderChildFunction
  renderCustomMarkers?: RenderCustomMarkers
  value: PortableTextBlock[] | undefined
}

const renderDecorator: RenderDecoratorFunction = (mark, mType, attributes, defaultRender) => {
  return <Decorator mark={mark}>{defaultRender()}</Decorator>
}

function PortableTextSanityEditor(props: Props) {
  const {
    initialSelection,
    isFullscreen,
    markers,
    onCopy,
    onFocus,
    onFormBuilderChange,
    onPaste,
    onToggleFullscreen,
    readOnly,
    renderAnnotation,
    renderBlock,
    renderBlockActions,
    renderChild,
    renderCustomMarkers,
    value
  } = props

  const handleOpenObjectHotkey = (
    event: React.BaseSyntheticEvent,
    ptEditor: PortableTextEditor
  ) => {
    const selection = PortableTextEditor.getSelection(ptEditor)
    if (selection) {
      event.preventDefault()
      event.stopPropagation()
      const {focus} = selection
      const activeAnnotations = PortableTextEditor.activeAnnotations(ptEditor)
      const focusBlock = PortableTextEditor.focusBlock(ptEditor)
      const focusChild = PortableTextEditor.focusChild(ptEditor)
      if (activeAnnotations.length > 0) {
        onFocus([
          ...focus.path.slice(0, 1),
          'markDefs',
          {_key: activeAnnotations[0]._key},
          FOCUS_TERMINATOR
        ])
        return
      }
      if (focusChild && PortableTextEditor.isVoid(ptEditor, focusChild)) {
        onFocus([...focus.path, FOCUS_TERMINATOR])
        return
      }
      if (focusBlock && PortableTextEditor.isVoid(ptEditor, focusBlock)) {
        onFocus([...focus.path.slice(0, 1), FOCUS_TERMINATOR])
      }
    }
  }
  const customFromProps: HotkeyOptions = {
    custom: {
      'mod+enter': props.onToggleFullscreen,
      // 'mod+o': handleOpenObjectHotkey, // TODO: disabled for now, enable when we agree on the hotkey
      ...(props.hotkeys || {}).custom
    }
  }
  const marksFromProps: HotkeyOptions = {
    marks: {
      'mod+b': 'strong',
      'mod+i': 'em',
      'mod+u': 'underline',
      "mod+'": 'code',
      ...(props.hotkeys || {}).marks
    }
  }
  const hotkeys: HotkeyOptions = {
    ...marksFromProps,
    ...customFromProps
  }

  const hasMarkers = markers.length > 0
  const scClassNames = [
    styles.scrollContainer,
    ...(renderBlockActions || hasMarkers ? [styles.hasBlockExtras] : [styles.hasNoBlockExtras])
  ].join(' ')
  const editorWrapperClassNames = [styles.editorWrapper].join(' ')
  const editorClassNames = [
    styles.editor,
    ...(renderBlockActions || hasMarkers ? [styles.hasBlockExtras] : [styles.hasNoBlockExtras])
  ].join(' ')

  const blockExtras = useCallback(
    () => (
      <BlockExtrasOverlay
        isFullscreen={isFullscreen}
        markers={markers}
        onFocus={onFocus}
        onChange={onFormBuilderChange}
        renderBlockActions={readOnly ? undefined : renderBlockActions}
        renderCustomMarkers={renderCustomMarkers}
        value={value}
      />
    ),
    [isFullscreen, value]
  )

  // Needed for rendering the overlay in the correct place when toggling fullscreen.
  const [forceUpdate, setForceUpdate] = useState(0)
  useEffect(() => {
    setForceUpdate(forceUpdate + 1)
  }, [])

  const editor = useMemo(
    () => (
      <div className={styles.editorBox}>
        <div className={styles.header}>
          <div className={styles.toolbarContainer}>
            <Toolbar
              isFullscreen={isFullscreen}
              hotkeys={hotkeys}
              onFocus={onFocus}
              renderBlock={renderBlock}
              readOnly={readOnly}
            />
          </div>
          <div className={styles.fullscreenButtonContainer}>
            <ExpandCollapseButton
              isFullscreen={isFullscreen}
              onToggleFullscreen={onToggleFullscreen}
            />
          </div>
        </div>
        <ScrollContainer className={scClassNames}>
          <div className={editorWrapperClassNames}>
            <div className={styles.blockExtras}>{blockExtras()}</div>
            <div className={editorClassNames}>
              <PortableTextEditable
                hotkeys={hotkeys}
                onCopy={onCopy}
                onPaste={onPaste}
                placeholderText={value ? undefined : 'Empty'}
                renderAnnotation={renderAnnotation}
                renderBlock={renderBlock}
                renderChild={renderChild}
                renderDecorator={renderDecorator}
                selection={initialSelection}
                spellCheck
              />
            </div>
          </div>
        </ScrollContainer>
      </div>
    ),
    [initialSelection, isFullscreen, value, readOnly, forceUpdate]
  )
  return editor
}

export default PortableTextSanityEditor
