import React, { createContext, useReducer, useContext } from 'react';

type User = { name: string; email: string } | null;

type State = { user: User };
type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' };

const initialState: State = { user: null };

function authReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: State;
  login: (user: User) => void;
  logout: () => void;
}>({
  state: initialState,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = (user: User) => dispatch({ type: 'LOGIN', payload: user });
  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
