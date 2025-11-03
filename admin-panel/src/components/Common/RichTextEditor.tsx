import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  height = 600,
  placeholder = 'Start writing your article...',
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="rich-text-editor">
      <Editor
        tinymceScriptSrc="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js"
        onInit={(_evt: any, editor: any) => {
          editorRef.current = editor;
        }}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
            'emoticons', 'template', 'codesample'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | link image | code | table | fullscreen',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              font-size: 16px;
              line-height: 1.6;
              color: #333;
            }
            h2 { font-size: 28px; font-weight: 700; margin-top: 24px; margin-bottom: 16px; }
            h3 { font-size: 24px; font-weight: 600; margin-top: 20px; margin-bottom: 12px; }
            h4 { font-size: 20px; font-weight: 600; margin-top: 16px; margin-bottom: 10px; }
            p { margin-bottom: 16px; }
            ul, ol { margin-bottom: 16px; padding-left: 30px; }
            li { margin-bottom: 8px; }
            blockquote { 
              border-left: 4px solid #ddd;
              padding-left: 20px;
              margin: 20px 0;
              font-style: italic;
              color: #666;
            }
            code { 
              background: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
            pre { 
              background: #f4f4f4;
              padding: 16px;
              border-radius: 4px;
              overflow-x: auto;
            }
            img { max-width: 100%; height: auto; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; }
            table td, table th { border: 1px solid #ddd; padding: 8px; }
            table th { background-color: #f4f4f4; font-weight: 600; }
          `,
          placeholder: placeholder,
          branding: false,
          promotion: false,
          resize: true,
          autosave_ask_before_unload: true,
          autosave_interval: '30s',
          autosave_prefix: 'article-',
          autosave_restore_when_empty: false,
          autosave_retention: '2m',
          image_advtab: true,
          image_title: true,
          image_description: false,
          image_dimensions: true,
          file_picker_types: 'image',
          file_picker_callback: (callback: any, value: any, meta: any) => {
            // Custom file picker - can integrate with image upload component
            if (meta.filetype === 'image') {
              // Open image upload modal or trigger file input
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (file) {
                  // Here you would upload the file and get the URL
                  // For now, create a local preview
                  const reader = new FileReader();
                  reader.onload = () => {
                    callback(reader.result as string, { alt: file.name });
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }
          },
          paste_data_images: true,
          paste_as_text: false,
          paste_word_valid_elements: 'b,strong,i,em,h1,h2,h3,h4,h5,h6,p,ol,ul,li,a[href],span,color,font-size,font-weight,font-style,text-decoration',
          paste_retain_style_properties: 'color font-size font-weight font-style text-decoration',
          convert_urls: false,
          relative_urls: false,
          remove_script_host: false,
          document_base_url: window.location.origin,
        }}
      />
    </div>
  );
};

export default RichTextEditor;

