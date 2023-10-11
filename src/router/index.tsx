import { ComponentType, Suspense, lazy } from "react";

interface LoaderProps {}

const Loader = <P extends {}>(
  Component: ComponentType<P>
): React.FC<P & LoaderProps> => {
  const LoaderComponent: React.FC<P & LoaderProps> = (props) => (
    <Suspense fallback={<div>Loading...</div>}>
      <Component {...props} />
    </Suspense>
  );

  return LoaderComponent;
};

const Chat = Loader(lazy(() => import("../components/Chat/")));

const routes = [
  {
    path: "",
    element: <Chat />,
  },
];

export default routes;
