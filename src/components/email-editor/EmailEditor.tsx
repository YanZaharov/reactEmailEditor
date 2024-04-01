import { Bold, Eraser, Italic, Underline } from 'lucide-react'
import { useRef, useState } from 'react'
import styles from './EmailEditor.module.scss'
import { TStyle, applyStyle } from './apple-style'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import parse from 'html-react-parser'
import { emailService } from '../../services/email.service'

export function EmailEditor() {
	const [text, setText] = useState(`Enter Text...`)
	const [selectionStart, setSelectionStart] = useState(0)
	const [selectionEnd, setSelectionEnd] = useState(0)

	const textRef = useRef<HTMLTextAreaElement | null>(null)

	const queryClient = useQueryClient()

	const { mutate, isPending } = useMutation({
		mutationKey: ['create email'],
		mutationFn: () => emailService.sendEmail(text),
		onSuccess() {
			setText('')
			queryClient.refetchQueries({ queryKey: ['email list'] })
		},
	})

	const updateSelection = () => {
		if (!textRef.current) return
		setSelectionStart(textRef.current.selectionStart)
		setSelectionEnd(textRef.current.selectionEnd)
	}

	const applyFormat = (type: TStyle) => {
		const selectedText = text.substring(selectionStart, selectionEnd) // Выделенный текст

		if (!selectedText) return

		const before = text.substring(0, selectionStart) // Текст до выделенного фрагмента

		const after = text.substring(selectionEnd) // Текст после выделенного фрагмента

		setText(before + applyStyle(type, selectedText) + after)
	}

	return (
		<div>
			<h1>Email Editor</h1>
			{text && <div className={styles.preview}>{parse(text)}</div>}
			<div className={styles.card}>
				<textarea
					ref={textRef}
					className={styles.editor}
					spellCheck='false'
					onSelect={updateSelection}
					value={text}
					onChange={e => setText(e.target.value)}
				/>
				<div className={styles.actions}>
					<div className={styles.tools}>
						<button onClick={() => setText('')}>
							<Eraser size={17} />
						</button>
						<button onClick={() => applyFormat('bold')}>
							<Bold size={17} />
						</button>
						<button onClick={() => applyFormat('italic')}>
							<Italic size={17} />
						</button>
						<button onClick={() => applyFormat('underline')}>
							<Underline size={17} />
						</button>
					</div>
					<button disabled={isPending} onClick={() => mutate()}>
						Send now
					</button>
				</div>
			</div>
		</div>
	)
}
