/*****************************************************************************/
/* App: The Global Application Namespace */
/*****************************************************************************/
App = {};


SinglePageLogin.config({
  loginTitle: 'Login',
  signupTitle: 'Sign Up',
  forgotPasswordTitle: 'Retrieve password',
  canRetrievePassword: true,
  passwordSignupFields: 'EMAIL_ONLY',
  forbidClientAccountCreation: true,
  routeAfterLogin: '/',
  routeAfterSignUp: '/',
  forceLogin: true,
});