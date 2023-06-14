
type Nullable<T> = T | null;

type TypeRef = MutableRefObject<HTMLInputElement>;
interface TypeRefs extends Record<string,TypeRef> {
  [key:string]: TypeRef
}

type TypeEventKeyboardAny     = KeyboardEvent<HTMLElement>;
type TypeEventHandlerKeyboard = (event: TypeEventKeyboardAny)    => void;

type TypeEventDragAny = DragEvent<HTMLElement>

type TypeHttpHeaders   = Record<string, string>;
type TypeRawHttpParams = Record<string, string | string[] | boolean>;
type TypeHttpParams    = TypeRawHttpParams | string;
