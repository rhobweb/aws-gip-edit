import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

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

// No idea why, but TS moans if the value type is set to anything other than 'any'
export interface TypeProgramEditInput extends Record<string,any> { // eslint-disable-line @typescript-eslint/no-explicit-any
	[PROG_FIELD_URI]       : string;
	[PROG_FIELD_TITLE]     : string;
	[PROG_FIELD_SYNOPSIS]  : string;
	[PROG_FIELD_IMAGE_URI] : string;
}

// No idea why, but TS moans if the value type is set to anything other than 'any'
export interface TypeProgramEditOptions extends Record<string,any> { // eslint-disable-line @typescript-eslint/no-explicit-any
	[PROG_FIELD_GENRE]       : string;
	[PROG_FIELD_DAY_OF_WEEK] : string;
	[PROG_FIELD_QUALITY]     : string;
}

// No idea why, but TS moans if the value type is set to anything other than 'any'
export interface TypeProgramItem  extends Record<string,any> { // eslint-disable-line @typescript-eslint/no-explicit-any
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

export type TypeProgramList = TypeProgramItem[];

export type TypeHandlerProgramChange = ( newPrograms: TypeProgramList ) => void;

export type TypeProgramDownloadOptions = {
	all?:        boolean,
	current?:    boolean,
	downloaded?: boolean
};

export type TypeEndpointDef = {
	method:   string,
	uri:      string,
	params?:  TypeHttpParams,
	headers?: TypeHttpHeaders,
};

export type TypeEndpointOptions = {
	method:   string,
	headers?: TypeHttpHeaders,
	body?:    TypeHttpParams,
	mode?:    string,
};

export type TypeEndpoint = {
	uri:     string,
	options: TypeEndpointOptions,
};

export type TypeEventChangeInput      = ChangeEvent<HTMLInputElement>;
//export type TypeEventKeyboardAny      = KeyboardEvent<any>;
export type TypeEventMouse            = MouseEvent<HTMLInputElement>;
export type TypeEventChangeSelect     = ChangeEvent<HTMLSelectElement>;

export type TypeEventKeyboardInput    = KeyboardEvent<HTMLInputElement>;
export type TypeEventKeyboardSelect   = KeyboardEvent<HTMLSelectElement>;
export type TypeEventKeyboardTextArea = KeyboardEvent<HTMLTextAreaElement>;
export type TypeEventKeyboardImage    = KeyboardEvent<HTMLImageElement>;

export type TypeEventHandlerInputChange  = (event: TypeEventChangeInput)    => void;
export type TypeEventHandlerMouse        = (event: TypeEventMouse)          => void;
export type TypeEventHandlerSelectChange = (event: TypeEventChangeSelect)   => void;
export type TypeEventHandlerSelectKey    = (event: TypeEventKeyboardSelect) => void;

//export type TypeHandlerProgramChange     = ( programs: { newPrograms: TypeProgramItem[] } ) => void;
