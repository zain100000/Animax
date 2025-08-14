import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/globalStyles.css";
import "./authCss/Signin.css";
import Logo from "../../assets/logo/logo.png";
import InputField from "../../utils/customInputField/InputField";
import Button from "../../utils/customButton/Button";
import {
  validateEmail,
  validatePassword,
  validateFields,
} from "../../utils/customValidations/Validations";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "../../redux/slices/authSlice";

const Signin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const hasErrors = emailError || passwordError || !email || !password;
  }, [emailError, passwordError, email, password]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  const handleSignin = async (event) => {
    event.preventDefault();

    const fields = { email, password };
    const errors = validateFields(fields);
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      toast.error(errors[firstErrorKey]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const loginData = { email, password };
      const resultAction = await dispatch(login(loginData));

      if (login.fulfilled.match(resultAction)) {
        toast.success("Login Successfully");
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 2000);

        setEmail("");
        setPassword("");
      } else {
        const errorMessage =
          login.rejected.match(resultAction) && resultAction.payload
            ? resultAction.payload.error || "Login failed. Please try again."
            : "Unexpected response from server.";

        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("An error occurred during login:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signin-screen">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-sm-12 col-md-12 col-lg-6">
            <div className="card">
              <div className="card-body">
                <div className="logo-container">
                  <img src={Logo} alt="Logo" className="logo" />
                  <span className="logo-text">Animax</span>
                </div>

                <form className="form-container">
                  <div className="email-container">
                    <InputField
                      label="Email"
                      type="text"
                      editable={true}
                      value={email}
                      onChange={handleEmailChange}
                      icon={<i className="fas fa-envelope"></i>}
                    />
                  </div>

                  <div className="password-container">
                    <InputField
                      label="Password"
                      type="password"
                      secureTextEntry={true}
                      editable={true}
                      value={password}
                      onChange={handlePasswordChange}
                      icon={<i className="fas fa-lock"></i>}
                    />
                  </div>

                  <div className="forgot-password-container">
                    <label className="fg-label">Forgot Password</label>
                  </div>

                  <div className="btn-container">
                    <Button
                      title="Signin"
                      width={"100%"}
                      onPress={handleSignin}
                      loading={loading}
                      icon={<i class="fas fa-sign-in-alt"></i>}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
