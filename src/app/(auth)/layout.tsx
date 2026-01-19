const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="gid place-items-center min-h-screen bg-[url(/fondo.png)]  bg-cover bg-center bg-no-repeat">
      {children}
    </div>
  );
};

export default AuthLayout;
