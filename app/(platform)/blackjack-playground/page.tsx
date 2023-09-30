import { auth, currentUser, redirectToSignIn } from '@clerk/nextjs';
import { LobbyClient } from './components/client';

const LobbyIdPage = async () => {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    return redirectToSignIn;
  }

  return <LobbyClient />;
};

export default LobbyIdPage;
