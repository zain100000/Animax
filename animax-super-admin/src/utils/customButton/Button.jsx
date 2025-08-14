import Loader from "../customLoader/Loader";
import "../../styles/globalStyles.css";
import "./Button.css";

const Button = ({
  onPress,
  title,
  loading,
  style,
  textStyle,
  width,
  disabled,
  height,
  variant,
  icon,
}) => {
  return (
    <section id="button">
      <button
        className={`custom-button ${variant || "btn-primary"} ${
          disabled ? "disabled" : ""
        }`}
        onClick={onPress}
        style={{
          ...style,
          width: width || "auto",
          height: height || "auto",
        }}
        disabled={disabled}
      >
        {loading ? (
          <Loader loading={loading} size={20} color="#fff" />
        ) : (
          <span
            style={{
              display: "flex",
              justifyContent:'center',
              alignItems: "center",
              gap: "0.5rem",
              ...textStyle,
            }}
          >
            {icon && <span className="button-icon">{icon}</span>}
            {title}
          </span>
        )}
      </button>
    </section>
  );
};

export default Button;
