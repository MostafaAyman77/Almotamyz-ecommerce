import { Field, ErrorMessage } from "formik";

interface Props {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    textarea?: boolean;
    dir?: "ltr" | "rtl";
}

export const FormInput = ({
    name,
    label,
    type = "text",
    placeholder,
    textarea,
    dir,
}: Props) => {
    return (
        <div>
            <label className="block text-sm font-medium mb-2">
                {label} <span className="text-red-500">*</span>
            </label>

            <Field
                as={textarea ? "textarea" : "input"}
                name={name}
                type={type}
                dir={dir}
                placeholder={placeholder}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{ borderColor: "var(--border-color)" }}
            />

            <ErrorMessage
                name={name}
                component="p"
                className="text-red-500 text-sm mt-1"
            />
        </div>
    );
};
