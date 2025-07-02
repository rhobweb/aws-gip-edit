/**
 * File:        utils/gip_types.ts
 * Description: Types used throughout this app.
 */
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export type Nullable<T> = T | null;
export type Falsy<T>    = T | null | undefined;

export type Type_HttpHeaders   = Record<string, string>;
export type Type_RawHttpParams = Record<string, string | string[] | boolean>;
export type Type_HttpParams    = Type_RawHttpParams | string;

export const PROG_FIELD_URI         = 'uri';
export const PROG_FIELD_PID         = 'pid';
export const PROG_FIELD_STATUS      = 'status';
export const PROG_FIELD_TITLE       = 'title';
export const PROG_FIELD_SYNOPSIS    = 'synopsis';
export const PROG_FIELD_IMAGE_URI   = 'image_uri';
export const PROG_FIELD_GENRE       = 'genre';
export const PROG_FIELD_DAY_OF_WEEK = 'day_of_week';
export const PROG_FIELD_QUALITY     = 'quality';
export const PROG_FIELD_SELECTED    = 'selected';

export interface Type_ProgramEditInput {
	[PROG_FIELD_URI]       : string;
	[PROG_FIELD_TITLE]     : string;
	[PROG_FIELD_SYNOPSIS]  : string;
	[PROG_FIELD_IMAGE_URI] : string;
}

export interface Type_ProgramEditOptions {
	[PROG_FIELD_GENRE]       : string;
	[PROG_FIELD_DAY_OF_WEEK] : string;
	[PROG_FIELD_QUALITY]     : string;
}

export interface Type_DisplayProgramItem {
	[PROG_FIELD_URI]         : string;
	[PROG_FIELD_PID]         : string;
	[PROG_FIELD_STATUS]      : string;
	[PROG_FIELD_TITLE]       : string;
	[PROG_FIELD_SYNOPSIS]    : string;
	[PROG_FIELD_IMAGE_URI]   : string;
	[PROG_FIELD_GENRE]       : string;
	[PROG_FIELD_DAY_OF_WEEK] : string;
	[PROG_FIELD_QUALITY]     : string;
	[PROG_FIELD_SELECTED]    : boolean;
}

export type Type_DisplayProgramItemPropName       = keyof Type_DisplayProgramItem;
export type Type_DisplayProgramItemStringPropName = Exclude<Type_DisplayProgramItemPropName,typeof PROG_FIELD_SELECTED>;

export type Type_ProgramList = Type_DisplayProgramItem[];

export type Type_HandlerProgramChange = ( newPrograms: Type_ProgramList ) => void;

export interface Type_ProgramDownloadOptions {
	all?:        boolean,
	current?:    boolean,
	downloaded?: boolean
}

export interface Type_EndpointDef {
	method:   string,
	uri:      string,
	params?:  Type_HttpParams,
	headers?: Type_HttpHeaders,
}

export interface Type_EndpointOptions {
	method:   string,
	headers?: Type_HttpHeaders,
	body?:    Type_HttpParams,
	mode?:    string,
}

export interface Type_Endpoint {
	uri:     string,
	options: Type_EndpointOptions,
}

export type Type_EventChangeInput      = ChangeEvent<HTMLInputElement>;
//export type Type_EventKeyboardAny      = KeyboardEvent<any>;
export type Type_EventMouse            = MouseEvent<HTMLInputElement>;
export type Type_EventChangeSelect     = ChangeEvent<HTMLSelectElement>;

export type Type_EventKeyboardInput    = KeyboardEvent<HTMLInputElement>;
export type Type_EventKeyboardSelect   = KeyboardEvent<HTMLSelectElement>;
export type Type_EventKeyboardTextArea = KeyboardEvent<HTMLTextAreaElement>;
export type Type_EventKeyboardImage    = KeyboardEvent<HTMLImageElement>;

export type Type_EventHandlerInputChange  = (event: Type_EventChangeInput)    => void;
export type Type_EventHandlerMouse        = (event: Type_EventMouse)          => void;
export type Type_EventHandlerSelectChange = (event: Type_EventChangeSelect)   => void;
export type Type_EventHandlerSelectKey    = (event: Type_EventKeyboardSelect) => void;

//export type Type_HandlerProgramChange     = ( programs: { newPrograms: Type_DisplayProgramItem[] } ) => void;
