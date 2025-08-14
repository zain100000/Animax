import "../../styles/globalStyles.css";
import "./InputField.css";

const InputField = ({
  value,
  onChange,
  placeholder,
  style,
  inputStyle,
  secureTextEntry,
  editable = true,
  dropdownOptions,
  selectedValue,
  onValueChange,
  bgColor,
  textColor,
  width,
  label,
  type,
  fullWidth = false,
  required = false,
  multiline = false,
  rows = 3,
  icon,
}) => {
  return (
    <section id="input-field">
      <div
        className="custom-input-wrapper"
        style={{ ...style, width: width || "100%" }}
      >
        {dropdownOptions ? (
          <div className="input-container no-float">
            {icon && <span className="input-icon">{icon}</span>}
            <select
              className="custom-input"
              value={selectedValue}
              onChange={onValueChange}
              required={required}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                width: fullWidth ? "100%" : "auto",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            >
              <option value="" disabled>
                {label || placeholder}
              </option>
              {dropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : multiline ? (
          <div className="input-container no-float">
            {icon && <span className="input-icon">{icon}</span>}
            <textarea
              value={value}
              onChange={onChange}
              placeholder={label || placeholder}
              required={required}
              rows={rows}
              className="custom-input"
              readOnly={!editable}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            />
          </div>
        ) : (
          <div className={`input-container ${value ? "has-value" : ""}`}>
            {icon && <span className="input-icon">{icon}</span>}
            <input
              id={label}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              type={type || (secureTextEntry ? "password" : "text")}
              className="custom-input"
              required={required}
              readOnly={!editable}
              style={{
                backgroundColor: bgColor || "var(--white)",
                color: textColor || "var(--dark)",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            />
            <label htmlFor={label} className="floating-label">
              {label}
            </label>
          </div>
        )}
      </div>
    </section>
  );
};

export default InputField;
