/// <reference types="react-scripts" />

declare module '@tinymce/tinymce-react' {
  import { Component } from 'react';
  
  export interface IAllProps {
    id?: string;
    inline?: boolean;
    initialValue?: string;
    value?: string;
    onInit?: (evt: any, editor: any) => void;
    onEditorChange?: (content: string, editor: any) => void;
    onBeforePaste?: (evt: any, editor: any) => void;
    onPaste?: (evt: any, editor: any) => void;
    onSelectionChange?: (evt: any, editor: any) => void;
    onSkinLoadError?: (e: any) => void;
    onThemeLoadError?: (e: any) => void;
    onModelLoadError?: (e: any) => void;
    onLanguageLoadError?: (e: any) => void;
    onPluginLoadError?: (e: any) => void;
    onIconsLoadError?: (e: any) => void;
    onFontLoadError?: (e: any) => void;
    onFormatLoadError?: (e: any) => void;
    onContentStyleLoadError?: (e: any) => void;
    onUploadProgress?: (progress: number) => void;
    onUploadComplete?: (result: any) => void;
    onUploadError?: (error: any) => void;
    scriptLoading?: { async?: boolean; defer?: boolean; delay?: number };
    textareaName?: string;
    cloudChannel?: string;
    plugins?: string | string[];
    toolbar?: string | string[];
    disabled?: boolean;
    tinymceScriptSrc?: string;
    init?: any;
    tagName?: string;
    outputFormat?: 'html' | 'text';
    [key: string]: any;
  }
  
  export class Editor extends Component<IAllProps> {}
}

declare module 'react-datepicker' {
  import { Component } from 'react';
  
  export interface ReactDatePickerProps {
    selected?: Date | null;
    onChange?: (date: Date | null, event?: React.SyntheticEvent) => void;
    minDate?: Date | null;
    maxDate?: Date | null;
    showTimeSelect?: boolean;
    timeIntervals?: number;
    dateFormat?: string;
    placeholderText?: string;
    className?: string;
    wrapperClassName?: string;
    [key: string]: any;
  }
  
  export default class DatePicker extends Component<ReactDatePickerProps> {}
}