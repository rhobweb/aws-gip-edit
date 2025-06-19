
import React from 'react';

export type Type_Ref  = React.RefObject<HTMLInputElement|null>;
export type Type_Refs = Record<string,Type_Ref>;

export type Type_EventKeyboardAny     = React.KeyboardEvent<HTMLElement>;
export type Type_EventHandlerKeyboard = (event: Type_EventKeyboardAny) => void;

export type Type_EventDragAny  = React.DragEvent<HTMLElement>;
export type Type_EventTouchAny = React.TouchEvent<HTMLElement>;
