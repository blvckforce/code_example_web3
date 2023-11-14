import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import loadable from "@loadable/component";
import "./styles/app.sass";
import Page from "./components/Page";
import NAVIGATE_ROUTES, { NAVIGATE_PARAMS } from "./config/routes";


import { AppWrappers } from "./utils/AppWrappers";

const LandingPage = loadable(() => import("./screens/LandingPage"));
const Home = loadable(() => import("./screens/Home"));
const Profile = loadable(() => import("./screens/Profile"));
const SignUp = loadable(() => import("./screens/Agent/Signup"));
const ArtistVerification = loadable(() => import("./screens/Profile/Verification"));
const Invitation = loadable(() => import("./screens/Invitation"));
const UploadVariants = loadable(() => import("./screens/UploadVariants"));
const UploadDetails = loadable(() => import("./screens/UploadDetails"));
const Faq = loadable(() => import("./screens/Faq"));
const Filterable = loadable(() => import("./screens/Filterable"));
const Search02 = loadable(() => import("./screens/Search02"));
const CollectionView = loadable(() => import("./screens/Profile/Collection/CollectionView"));
const Item = loadable(() => import("./screens/Item"));
const AccountSettings = loadable(() => import("./screens/AccountSettings"));
const AgentStats = loadable(() => import("./screens/Agent/AgencyStats"));

const App = () => (
  <AppWrappers>
    <Router>
      <Switch>
        <Route exact path='/' render={() => (<Page><LandingPage /></Page>)} />
        <Route exact path={NAVIGATE_ROUTES.HOME} render={() => (<Page><Home /></Page>)} />
        <Route exact path={NAVIGATE_ROUTES.SIGN_UP_PAGE} render={() => <SignUp />} />
        <Route exact path={NAVIGATE_ROUTES.ARTIST_VERIFICATION}
               render={() => (<Page><ArtistVerification /></Page>)} />
        <Route exact path={`${NAVIGATE_ROUTES.INVITATION}/:${NAVIGATE_PARAMS.INVITATION_TOKEN}`}
               render={() => (<Page><Invitation /></Page>)} />
        <Route exact path={NAVIGATE_ROUTES.UPLOAD_VARIANTS} render={() => (<Page><UploadVariants /></Page>)} />

        <Route exact
               path={`${NAVIGATE_ROUTES.UPLOAD_DETAILS}/:${NAVIGATE_PARAMS.UPLOAD_MODE}/:${NAVIGATE_PARAMS.NFT_TOKEN_ID}?`}
               render={() => (<Page><UploadDetails /></Page>)} />

        <Route exact path={NAVIGATE_ROUTES.FAQ} render={() => (<Page><Faq /></Page>)} />
        <Route exact path={NAVIGATE_ROUTES.NOTIFICATION}
               render={() => (<Page><Filterable moduleName='notification' /></Page>)} />

        <Route exact path={`${NAVIGATE_ROUTES.EXPLORE}/:${NAVIGATE_PARAMS.SELECTED_CATEGORY}?`}
               render={() => (<Page><Filterable moduleName='explore' /></Page>)} />

        <Route exact path={`${NAVIGATE_ROUTES.MARKET}/:${NAVIGATE_PARAMS.SELECTED_CATEGORY}?`}
               render={() => (<Page><Filterable moduleName='explore' /></Page>)} />

        <Route exact path={NAVIGATE_ROUTES.ACTIVITY}
               render={() => (<Page><Filterable moduleName='activity' /></Page>)} />
        <Route exact path={NAVIGATE_ROUTES.SEARCH} render={() => (<Page><Search02 /></Page>)} />
        <Route exact path={NAVIGATE_ROUTES.FOLLOWING}
               render={() => (<Page><Profile tab='following' /></Page>)} />
        <Route exact path={`${NAVIGATE_ROUTES.PROFILE}/:${NAVIGATE_PARAMS.PROFILE_ID}?`}
               render={() => (<Page><Profile /></Page>)} />
        <Route exact
               path={`${NAVIGATE_ROUTES.PROFILE}${NAVIGATE_ROUTES.COLLECTION_VIEW}/:${NAVIGATE_PARAMS.COLLECTION_ID}?`}
               render={() => (<Page><CollectionView /></Page>)} />
        {/* FIXME: collection page */}
        <Route exact
               path={`${NAVIGATE_ROUTES.COLLECTION_VIEW}/:${NAVIGATE_PARAMS.COLLECTION_ID}?`}
               render={() => (<Page><Filterable moduleName={'collection'} /></Page>)} />

        <Route exact path={`${NAVIGATE_ROUTES.ITEM_PAGE}/:${NAVIGATE_PARAMS.NFT_ID}`}
               render={() => (<Page><Item /></Page>)} />
        <Route exact path={`${NAVIGATE_ROUTES.ACCOUNT_SETTINGS}/:${NAVIGATE_PARAMS.ACCOUNT_TAB}?`}
               render={() => (<Page><AccountSettings /></Page>)} />
        <Route exact path={NAVIGATE_ROUTES.AGENT_STATS_PAGE} render={() => (<Page><AgentStats /></Page>)} />
      </Switch>
    </Router>
  </AppWrappers>
);

export default App;
