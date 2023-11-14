export const BuildProviderTree = (providers = []) => ({ children }) => {
  const lastIndex = providers.length - 1;
  let activeChildren = children;

  for (let i = lastIndex; i >= 0; i--) {
    const [Provider, props] = Array.isArray(providers[i]) ? providers[i] : [providers[i]];
    activeChildren = <Provider {...(props ?? {})} >{activeChildren}</Provider>;
  }

  return activeChildren;
};
