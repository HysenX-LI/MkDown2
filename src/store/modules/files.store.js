import { nanoid } from 'nanoid';
import { saveToStorage } from '~/utils/helper';

export default {
  state: () => ({
    files: {},
    activeFile: '',
  }),
  getters: {
    all: (state) =>
      Object.keys(state.files).map((key) => ({
        id: key,
        ...state.files[key],
      })),
    active: (state) => {
      const file = state.files[state.activeFile] || {};

      file.id = state.activeFile;

      return file;
    },
  },
  mutations: {
    updateState(state, { key, value }) {
      state[key] = value;
    },
    addFile(state, { id, data }) {
      state.files[id] = data;

      saveToStorage('files', state.files);
    },
    updateFile(state, { id, key, value }) {
      state.files[id][key] = value;

      saveToStorage('files', state.files);
    },
    deleteFile(state, id) {
      delete state.files[id];

      saveToStorage('files', state.files);
    },
    changeActive(state, id) {
      state.activeFile = id;

      localStorage.setItem('activeFile', JSON.stringify(id));
    },
  },
  actions: {
    add({ commit }, { activate, data }) {
      return new Promise((resolve) => {
        const id = nanoid();

        commit('addFile', { id, data });

        if (activate) commit('changeActive', id);

        resolve(id);
      });
    },
    delete({ state, getters, commit }) {
      const id = state.activeFile;

      commit('deleteFile', id);
      commit('changeActive', getters.all[0].id);
    },
    async retrieve({ commit, getters, dispatch }) {
      try {
        const files = localStorage.getItem('files');
        const activeFile = localStorage.getItem('activeFile');

        if (files === null) {
          const defaultContent =
            '# MkDown\n\n How to use MkDown Markdown Editor:\n\n- Type some markdown in left side\n- See the preview on right side\n- And Voilà\n\n## Feature\n\n- Import Markdown file from your pc\n- Import your HTML file and convert it to markdown\n- Export your document as a Markdown file, HTML or HTML styled file';

          dispatch('add', {
            activate: true,
            data: {
              title: 'MkDown',
              content: defaultContent,
            },
          });

          return;
        }

        if (activeFile === null) {
          commit('changeActive', getters.allFiles[0].id);

          return;
        }

        if (files && activeFile) {
          commit('updateState', {
            key: 'files',
            value: JSON.parse(files),
          });

          commit('updateState', {
            key: 'activeFile',
            value: JSON.parse(activeFile),
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
};
