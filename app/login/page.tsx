export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">

      <div className="bg-white p-8 rounded-xl shadow w-96">

        <h1 className="text-xl font-bold mb-6">
          Aura Club Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
        />

        <button className="w-full bg-indigo-600 text-white p-2 rounded">
          Login
        </button>

      </div>

    </div>
  )
}