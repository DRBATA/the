import { UserProvider } from '../contexts/user-context';

export default function UserProviderWrapper({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
