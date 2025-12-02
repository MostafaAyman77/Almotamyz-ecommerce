import RegisterForm from "./RegisterForm"

const RegisterPage = () => {
  return (
    <section className="mt-8 flex items-center justify-center">
      <div className="m-auto bg-white rounded-lg p-5 w-full md:w-2/3">
        <h1 className="text-3xl font-bold text-gray-800 mb-5">Register Page</h1>
        <RegisterForm />
      </div>
    </section>
  )
}

export default RegisterPage
