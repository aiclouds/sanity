/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-handler-names */

import * as React from 'react'
import Button, {ButtonColor} from 'part:@sanity/components/buttons/default'
import Dialog from 'part:@sanity/components/dialogs/default'

import ButtonGrid from 'part:@sanity/components/buttons/button-grid'
import PopOverDialog from 'part:@sanity/components/dialogs/popover'
import Snackbar from 'part:@sanity/components/snackbar/default'

import styles from './documentStatusBar.css'

// Todo: move these to action spec/core types
interface ConfirmDialogProps {
  type: 'confirm'
  color: ButtonColor
  message: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
}

// Todo: move these to action spec/core types
interface ModalDialogProps {
  type: 'modal'
  content: React.ReactNode
  onClose: () => void
  showCloseButton: true
}

// Todo: move these to action spec/core types
interface PopOverDialogProps {
  type: 'popover'
  content: React.ReactNode
  onClose: () => void
}

interface LegacyDialogProps {
  type: 'legacy'
  content: React.ReactNode
  onClose: () => void
}

interface ErrorDialogProps {
  type: 'error'
  title: string
  content: React.ReactNode
  onClose: () => void
}

interface SuccessDialogProps {
  type: 'success'
  title: string
  content: React.ReactNode
  onClose: () => void
}

interface Props {
  dialog:
    | ConfirmDialogProps
    | LegacyDialogProps
    | ModalDialogProps
    | PopOverDialogProps
    | ErrorDialogProps
    | SuccessDialogProps
}

export function ActionStateDialog(props: Props) {
  const {dialog} = props

  if (dialog.type === 'legacy') {
    return <>{dialog.content}</>
  }

  if (dialog.type === 'confirm') {
    return (
      <PopOverDialog
        onClickOutside={dialog.onCancel}
        placement="auto-end"
        useOverlay={false}
        hasAnimation
      >
        <>
          <div className={styles.popOverText}>{dialog.message}</div>
          <ButtonGrid>
            <Button onClick={dialog.onCancel} kind="simple">
              Cancel
            </Button>
            <Button onClick={dialog.onConfirm} color={dialog.color || 'danger'}>
              Confirm
            </Button>
          </ButtonGrid>
        </>
      </PopOverDialog>
    )
  }

  if (dialog.type === 'modal') {
    return (
      <Dialog
        onClose={dialog.onClose}
        onClickOutside={dialog.onClose}
        showCloseButton={dialog.showCloseButton}
        size="medium"
        padding="large"
      >
        {dialog.content}
      </Dialog>
    )
  }

  if (dialog.type === 'popover') {
    return (
      <PopOverDialog
        onClickOutside={dialog.onClose}
        placement="auto-end"
        useOverlay={false}
        hasAnimation
      >
        {dialog.content}
      </PopOverDialog>
    )
  }

  if (dialog.type === 'success') {
    return (
      <Snackbar
        kind="success"
        isPersisted={false}
        isCloseable
        timeout={2000}
        onClose={dialog.onClose}
        title={dialog.title}
      >
        {dialog.content}
      </Snackbar>
    )
  }

  if (dialog.type === 'error') {
    return (
      <Snackbar isCloseable kind="error" onClose={dialog.onClose} title={dialog.title}>
        {dialog.content}
      </Snackbar>
    )
  }

  const unknownDialog: any = dialog

  // eslint-disable-next-line no-console
  console.warn(`Unsupported dialog type ${unknownDialog.type}`)

  return (
    <Dialog
      onClose={unknownDialog.onClose}
      onClickOutside={unknownDialog.onClose}
      size="medium"
      padding="large"
    >
      {unknownDialog.content || `Don't know how to render dialog of type ${unknownDialog.type}`}
    </Dialog>
  )
}
