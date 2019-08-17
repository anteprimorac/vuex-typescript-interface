
import { Module, Store, path, createNamespacedHelpers, createHelpers, mapState, MergedCommitFor, StripNever, ObjKeyof, Lookup, Flatten, Commit, ActionPayload, ActionKeysNoPayload, MutationKeysNoPayload, MutationKeysWithPayload, MutationPayload, IsMutation, ActionTree, ActionKeys, ActionKeysRoot, ActionPayloadRoot, MutationKeysRoot, MutationPayloadRoot, mapGetters, mapMutations, mapActions, MutationKeys } from './index';

interface MergedModule {
  merged: number;
  readonly mergedGetter: string;
  mergedMutation (merged: number): void;
  mergedAction (payload: boolean): Promise<void>;
  modules: {
    mergedmerged: MergedMergedModule
  }
}

interface MergedMergedModule {
  mergedmerged: number;
  readonly mergedmergedGetter: [number];
  mergedmergedMutation (mergedmerged: number): void;
}

interface SubModule {
  namespaced: true,
  sub: string;
  readonly subGetter: boolean;
  subMutation (sub: string): void;
  subAction (payload: string): Promise<boolean>;
  modules: {
    subsub: SubSubModule
  }
}

interface SubSubModule {
  namespaced: true,
  subsub: number[];
  readonly subsubGetter: number[];
  subsubMutation (subsub: number[]): void;
  subsubAction (payload: number[]): Promise<number>;
}

interface RootStore {
  root: string;
  readonly rootGetter: [string, string];
  rootMutation (payload: [string, string]): void;
  rootAction (): Promise<string>;
  rootActionExplodePayload (payload: {x: number, y: number}): Promise<boolean>;
  modules: {
    sub: SubModule;
    merged: MergedModule;
  };
}

const merged: Module<MergedModule, RootStore> = {
  state: () => ({
    merged: 42
  }),
  getters: {
    mergedGetter (state, getter, rootState, rootGetters) {
      state.merged;
      getter.mergedGetter;
      rootState.merged.merged;
      rootState.sub.sub;
      rootState.sub.subsub.subsub;
      rootState.root;
      rootGetters.mergedGetter;
      rootGetters.rootGetter;
      rootGetters.mergedmergedGetter;
      return state.merged + 's';
    }
  },
  mutations: {
    mergedMutation (state, merged: number) {
      state.merged = merged;
    }
  },
  actions: {
    async mergedAction (context, payload: boolean): Promise<void> {
      context.commit('mergedMutation', context.state.merged * 2);
      context.commit('rootMutation', ['x', 'a'], { root: true });
    }
  },
  modules: {
    mergedmerged: {
      state: {
        mergedmerged: 21
      },
      getters: {
        mergedmergedGetter (state, getter, rootState, rootGetter) {
          return [state.mergedmerged]
        }
      },
      mutations: {
        mergedmergedMutation (state, mergedmerged) {
          state.mergedmerged = mergedmerged;
        }
      }
    }
  }
};

const sub: Module<SubModule, RootStore> = {
  namespaced: true,
  state: {
    sub: 'Hello World!'
  },
  getters: {
    subGetter (state, getter, rootState, rootGetters): boolean {
      return state.sub.length > rootState.root.length;
    }
  },
  mutations: {
    subMutation (state, sub: string): void {
      state.sub = sub;
    }
  },
  actions: {
    async subAction (context, payload: string): Promise<boolean> {
      return true;
    }
  },
  modules: {
    subsub: {
      namespaced: true,
      state: {
        subsub: [1, 2]
      },
      getters: {
        subsubGetter (state, getter, rootState, rootGetter) {
          return state.subsub.map(x => x * 2);
        }
      },
      mutations: {
        subsubMutation(state, payload) {
          state.subsub = payload;
        }
      },
      actions: {
        async subsubAction(context): Promise<number> {
          return context.state.subsub.length;
        }
      }
    }
  }
};

const root = new Store<RootStore>({
  state: {
    root: 'Root'
  },
  getters: {
    rootGetter (state, getters): [string, string] {
      state.root;
      state.merged.merged;
      state.sub.sub;
      getters.mergedGetter;
      getters.mergedmergedGetter;
      return [state.root + state.merged.merged.toFixed(1), state.sub.sub];
    }
  },
  mutations: {
    rootMutation(state, [root, sub]): void {
      state.root = root;
      state.sub.sub = sub;
    }
  },
  actions: {
    async rootAction (context, payload): Promise<string> {
      context.commit('mergedMutation', 33);
      context.commit('mergedmergedMutation', 33);
      return context.state.root.toUpperCase();
    },
    async rootActionExplodePayload (context, { x, y }): Promise<boolean> {
      return x === y;
    }
  },
  modules: {
    sub,
    merged
  }
});


interface IAuthModule {
  logout (): Promise<void>;
  login (creds: {username: string, password: string}): Promise<boolean>;
}

interface IProfileModule {
  email: string | null;
  created_at: Date | null;
  readonly age: number;
  setProfile (profile?: { email: string, created_at: Date }): void;
}

interface IFullStore {
  user: string | null;
  setUser (user: string | null): void;
  modules: {
    auth: IAuthModule,
    profile: IProfileModule,
    named: {
      namespaced: true;
      variable: string;
      variable2: string;
      readonly length: number;
      readonly length2: number;
      setVariable (variable: string): void;
      setVariable2 (): void;
      loadVariable (from: boolean): Promise<string>;
      loadVariable2 (): Promise<string>;
    }
  }
};

const full = new Store<IFullStore>({
  state: {
    user: null
  },
  mutations: {
    setUser (state, user) {
      state.user = user;
      if (!user) {
        state.profile.email = null;
        state.profile.created_at = null;
      }
    }
  },
  modules: {
    auth: {
      actions: {
        async logout ({ commit }) {
          commit('setUser', null, { root: true });
          commit('setProfile', undefined, { root: true });
        },
        async login ({ commit }, creds) {
          // get user from API
          const user = { id: 'id', email: 'email', created_at: new Date() };

          commit('setUser', user.id, { root: true });
          commit('setProfile', user, { root: true });
          commit(path<IFullStore>().module('named').mutation('setVariable'), 'yes', { root: true });
          return true;
        }
      }
    },
    profile: {
      state: {
        email: null,
        created_at: null
      },
      getters: {
        age (state) {
          return state.created_at ? new Date().getFullYear() - state.created_at.getFullYear() : 0;
        }
      },
      mutations: {
        setProfile (state, profile) {
          state.email = profile ? profile.email : null;
          state.created_at = profile ? profile.created_at : null;
        }
      }
    },
    named: {
      namespaced: true,
      state: {
        variable: '',
        variable2: ''
      },
      getters: {
        length (state, getters) {
          return state.variable.length;
        },
        length2 (state, getters) {
          return state.variable2.length;
        }
      },
      mutations: {
        setVariable (state, value) {
          state.variable = value;
        },
        setVariable2 (state, isUnknown) {
          state.variable2 = '';
        }
      },
      actions: {
        async loadVariable (context, from) {
          return context.state.variable;
        },
        async loadVariable2 (context, isUnknown) {
          return context.state.variable2;
        }
      }
    }
  }
});

type A = MutationKeysNoPayload<IProfileModule>; // never
type B = MutationKeysWithPayload<IProfileModule>; // setProfile
type C = MutationPayload<(profile?: { email: string, created_at: Date }) => void>; // { email: string; created_at: Date; } | undefined
type C2 = MutationPayload<(profile: { email: string, created_at: Date }) => void>; // { email: string; created_at: Date; }
type C3 = MutationPayload<() => void>; // never
type E = MutationPayload<() => void>; // never
type D = ActionPayload<(profile?: { email: string, created_at: Date }) => Promise<void>>; // { email: string; created_at: Date; } | undefined

type F1 = ((x: number) => void) extends (() => void) ? true : false; // false
type F2 = ((x?: number) => void) extends (() => void) ? true : false; // true
type F3 = ((x?: number) => void) extends ((x?: any) => void) ? true : false; // true
type F4 = ((x: number) => void) extends ((x?: any) => void) ? true : false; // true
type F5 = ((x: number) => void) extends ((x: any) => void) ? true : false; // true
type F6 = ((x?: number) => void) extends ((x: any) => void) ? true : false; // true
type F7 = (() => void) extends ((x: any) => void) ? true : false; // true
type F8 = (() => void) extends ((x: never) => void) ? true : false; // true
type F9 = [() => void] extends [(x: any) => void] ? true : false; // true
type FA = (() => void) extends ((x: number) => void) ? true : false; // true

type G1 = IsMutation<false, true, false>; // false
type G2 = IsMutation<() => void, true, false>; // true
type G3 = IsMutation<(x: any) => void, true, false>; // true
type G4 = IsMutation<(x?: any) => void, true, false>; // true
type G5 = IsMutation<(x?: any) => Promise<any>, true, false>; // false
type G6 = IsMutation<(x?: any) => Promise<any>, true, false>; // false

type H1 = ((x?: number) => void) extends ((p: infer P) => void) ? P : [never]; // number | undefined
type H2 = (() => void) extends ((p: infer P) => void) ? P : [never]; // unknown
type H3 = H2 extends unknown ? true : false; // true
type H4 = unknown extends 43 ? true : false; // false
type H5 = unknown extends H2 ? true : false; // true
type H6 = unknown extends any ? true : false; // true NO!
type HB = unknown extends null ? true : false; // false
type HC = unknown extends {} ? true : false; // false
type HD = unknown extends object ? true : false; // false
type H9 = any extends unknown ? true : false; // true
type H7 = unknown extends unknown ? true : false; // true
type H8 = unknown extends null ? true : false; // false
type HA = [unknown] extends [any] ? true : false; // true NO!
type GetArgs<T> = T extends (...args: infer A) => infer R ? A : never;
type HE = GetArgs<() => void>; // []
type HF = GetArgs<(x?: number, y?: boolean) => string>; // [(number | undefined)?, (boolean | undefined)?]
type HG = [] extends [] ? true : false; // true
type HH = [3] extends [] ? true : false; // false
type HI = [] extends [3] ? true : false; // false

type SingleItem<T, N = never> = T extends [infer E] ? E : N;
type HJ = SingleItem<[]>; // never
type HK = SingleItem<[3]>; // 3
type HL = SingleItem<[3, true]>; // never
type GetArg<T> = T extends (...any: infer A) => void ? (A extends ([infer E] | [(infer E)?]) ? E : never) : never;
type HM = GetArg<(x?: number) => void>; // never
type HN = GetArgs<(x?: number) => void>;
type HO = HN extends [(infer E)?] ? E : never;

type I0 = 42 extends never ? true : false; // false
type I1 = number extends never ? true : false; // false
type I2 = any extends never ? true : false; // boolean
type I3 = undefined extends never ? true : false; // false
type I4 = unknown extends never ? true : false; // false
type I5 = never extends never ? true : false; // true
type I6 = {} extends never ? true : false; // false
type I7 = null extends never ? true : false; // false

type J0 = never extends 42 ? true : false; // true
type J1 = never extends number ? true : false; // true
type J2 = never extends any ? true : false; // true
type J3 = never extends undefined ? true : false; // true
type J4 = never extends unknown ? true : false; // true
type J5 = never extends never ? true : false; // true
type J6 = never extends {} ? true : false; // true
type J7 = never extends null ? true : false; // true

type K4 = [undefined] extends [] ? true : false; // false


full.dispatch('login', undefined); // ERROR!
full.dispatch('login', { username: 'A', password: 'B'} );
full.dispatch('logout', 34); // ERROR!
full.dispatch('logout', undefined); // ERROR!
full.dispatch('logout');

full.commit('setUser', '543');
full.commit('setUser', undefined); // ERROR!
full.commit('setUser', 23); // ERROR!
full.commit('setUser', null);
full.commit('setProfile', undefined); 
full.commit('setProfile', { email: 'C', created_at: new Date() })
full.commit('setProfile'); // ERROR! 

                
const p = path<IFullStore>();
const m = p.module('named');
const s = m.state('variable');
const g = m.getter('length');
const u = m.mutation('setVariable');
const a = m.action('loadVariable');

full.commit(u, 'newValue!');
full.dispatch(a, true);

const rr = full.dispatch(a, true);

const maps1 = createNamespacedHelpers(m);
/*[x]*/ const m1 = maps1.mapState(['variable']); // variable: () => string;
/*[x]*/ const m2 = maps1.mapActions(['loadVariable']); // loadVariable: (payload: boolean) => Promise<string>
/*[x]*/ const m3 = maps1.mapGetters(['length']); // length: () => number
/*[x]*/ const m4 = maps1.mapMutations(['setVariable']); // setVariable: (payload: string) => void
/*[x]*/ const m5 = maps1.mapState({ a: s => s.variable }); // a: () => string
/*[x]*/ const m6 = maps1.mapActions({ lv: 'loadVariable' }); // lv: (payload: boolean) => Promise<string>
/*[x]*/ const m7 = maps1.mapGetters({ len: 'length' }); // len: () => number
/*[x]*/ const m8 = maps1.mapMutations({ setV: 'setVariable' }); // setV: (payload: string) => void;
/*[x]*/ const m9 = maps1.mapMutations({ setZ: 'setVariable2' }); // setZ: () => void;

const maps2 = createHelpers<IFullStore>();
/*[x]*/ const n1 = maps2.mapState(['user']); // user: () => string | null
/*[x]*/ const n2 = maps2.mapState(m, ['variable']); // variable: () => string
/*[ ]*/ const n3 = maps2.mapActions(m, ['loadVariable']); // loadVariable: (payload: boolean) => Promise<string>
/*[ ]*/ const n6 = maps2.mapMutations(m, ['setVariable']); // setVariable: (payload: string) => void;
/*[x]*/ const n7 = maps2.mapGetters(m, ['length']); // length: () => number
/*[ ]*/ const n8 = maps2.mapActions(m, ['loadVariable2']); // loadVariable2: () => Promise<string>
/*[ ]*/ const n9 = maps2.mapMutations(m, { setV: 'setVariable' }); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*[x]*/ const nb = maps2.mapState({ b: s => s.named.variable }); // b: () => string;
/*[ ]*/ const nc = maps2.mapActions(m, { lv: 'loadVariable' }); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/*[x]*/ const nd = maps2.mapState(m, { b: 'variable2' }); // b: () => string;

/*[x]*/ const o1 = mapState(p, ['user']); // user: () => string | null;
/*[x]*/ const o2 = mapState(m, ['variable']); // variable: () => string;
/*[x]*/ const o3 = mapState(m, { variableAlias: 'variable' }) // variableAlias: () => string;
/*[x]*/ const o4 = mapGetters(m, ['length']); // length: () => number;
/*[x]*/ const o5 = mapGetters(m, { len: 'length' }); // len: () => number;
/*[ ]*/ const o6 = mapMutations(m, ['setVariable']); // setVariable: (payload: string) => void;
/*[ ]*/ const o7 = mapMutations(m, { setV: 'setVariable' }); //
/*[ ]*/ const o8 = mapActions(m, ['loadVariable']); // loadVariable: (payload: boolean) => Promise<string>
/*[ ]*/ const o9 = mapActions(m, { custom: 'loadVariable' }); // 
/*[x]*/ const oa = mapMutations(m, { setW: (commit, x, y) => {} }); // setW: MutationOut<[any, any], void>
/*[x]*/ const ob = mapActions(m, { setY: async (dispatch, a: number, b: string) => {} }); // setY: ActionOut<[number, string], void>;

/*[x]*/ oa.setW(0, 5); // (x, y) => void
/*[x]*/ ob.setY(0, '5'); // (a, b) => Promise<void>

const { mapState: ms, mapGetters: mg, mapActions: ma, mapMutations: mm } = createNamespacedHelpers(m);
/*[x]*/ const p1 = ms(['variable']); // variable: () => string;
/*[x]*/ const p2 = mg(['length']); // length: () => number;
/*[x]*/ const p3 = ma(['loadVariable']); // loadVariable: (payload: boolean) => Promise<string>;
/*[x]*/ const p4 = mm(['setVariable']); // setVariable: (payload: string) => void;