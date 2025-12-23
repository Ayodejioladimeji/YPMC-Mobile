import * as React from "react";
import { View, ViewProps } from "react-native";

import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import Text, { type TextProps } from "@/components/ui/text";
import { colors, spacing } from "@/theme";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormItem = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ style, ...props }, ref) => {
    const id = React.useId();
    const styles = [{ gap: spacing.xs }, style];

    return (
      <FormItemContext.Provider value={{ id }}>
        <View ref={ref} style={styles} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = "FormItem";

const FormLabel = ({ style, ...props }: TextProps) => {
  const { error, formItemId } = useFormField();

  const styles = [error && { color: colors.destructive }, style];

  return <Text id={formItemId} style={styles} {...props} />;
};

// const FormControl = React.forwardRef<
//   React.ElementRef<typeof Slot>,
//   React.ComponentPropsWithoutRef<typeof Slot>
// >(({ ...props }, ref) => {
//   const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

//   return (
//     <Slot
//       ref={ref}
//       id={formItemId}
//       aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
//       aria-invalid={!!error}
//       {...props}
//     />
//   )
// })
// FormControl.displayName = "FormControl"

const FormMessage = ({ children, style, ...props }: TextProps) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  const styles = [{ color: colors.destructive }, style];

  return (
    <Text id={formMessageId} style={styles} {...props}>
      {body}
    </Text>
  );
};

export {
  useFormField,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  // FormControl,
  // FormDescription,
};
