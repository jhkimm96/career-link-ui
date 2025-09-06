'use client';

import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { imageApi } from '@/libs/editorUpload';

type Props = {
  value: string;
  onChange: (html: string) => void;
  style?: React.CSSProperties;
};

export default function RichTextEditor({ value, onChange, style }: Props) {
  const quillRef = useRef<ReactQuill | null>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      // 같은 파일 재선택 허용
      (input as HTMLInputElement).value = '';
      if (!file) return;

      try {
        // 1) 서버 업로드 → 응답 body의 URL 받기
        const imgUrl = await imageApi(file, 'JOB_POSTING');

        // 2) 현재 커서 위치에 이미지 삽입
        const editor = quillRef.current!.getEditor();
        const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };

        editor.insertEmbed(range.index, 'image', imgUrl, 'user');
        editor.setSelection(range.index + 1, 0);

        // 3) 컨트롤드 값 동기화 (되돌림 방지)
        onChange(editor.root.innerHTML);
      } catch (err) {
        console.error(err);
        alert('이미지 업로드에 실패했습니다.');
      }
    };
    input.click();
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: { image: imageHandler },
      },
      clipboard: { matchVisual: false },
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'indent',
    'color',
    'background',
    'link',
    'image',
  ];

  return (
    <ReactQuill
      ref={quillRef}
      style={style}
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
    />
  );
}
