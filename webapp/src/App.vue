<template lang="pug">
  div#id
    div.container-fluid
      section.hero.is-light
        div.hero-body
          div.has-text-centered
            img.header-img(
              src="./assets/vinyl.svg"
              )
            h1.title Vinyl Player Thing
      div#login.has-text-centered(
        v-if="!isLoggedIn"
        )
        a.button(
          href="http://localhost:8888/login"
          ) Login to Spotify
      div#playlists
        section.section
          div.columns.is-mobile
            div.column.is-four-fiths
              h4.is-size-4 Your Playlists
            div.column
              img#edit-icon(
                src="./assets/edit.svg"
                @click="toggleEditing"
                )
          ul.list
            li.list-item(
              v-for="item in list"
              )
                div.columns.is-mobile
                  div.column.is-two-thirds
                    p {{item.name}}
                  div.column
                    p.has-text-right
                      span.tag.is-primary(
                        v-if="item.rfid.length > 0 && !isEditing"
                        ) {{ item.rfid }}
                      span.tag.is-delete.is-danger.delete-tag(
                        v-if="item.rfid.length > 0 && isEditing",
                        @click="deleteTag(item.id)"
                        )
</template>

<script>
import { getPlaylists, getLinks } from './api'
export default {
  name: 'App',
  components: {},
  methods: {
    fillPlaylists: async function () {
      let playlists = []
      try {
        playlists = await getPlaylists()
        this.playlists = playlists
      } catch (e) {
        console.error(e)
      }
    },
    fillLinks: async function () {
      let links = {}
      try {
        const rawLinks = await getLinks()
        rawLinks.forEach((link) => {
          links[link.playlistId] = link.rfid
        })

        this.links = links
      } catch (e) {
        console.error(e)
      }
    },
    toggleEditing: function () {
      this.isEditing = !this.isEditing
    },
    deleteTag: function (id) {
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) {
          this.list[i].rfid = ''
        }
      }
    }
  },
  data: function () {
    return {
      isLoggedIn: false,
      accessToken: '',
      user: {},
      links: {},
      playlists: [],
      isEditing: false,
      list: []
    }
  },
  mounted: async function () {
    const urlString = window.location.href
    const url = new URL(urlString)
    const accessToken = url.searchParams.get('access_token')

    if (accessToken) {
      this.isLoggedIn = true
      this.accessToken = accessToken
    } else {
      return
    }

    await this.fillPlaylists()
    await this.fillLinks()

    if (this.playlists.length === 0) return

    for (let i = 0; i < this.playlists.length; i++) {
      let playlist = {
        name: this.playlists[i].name,
        rfid: '',
        id: this.playlists[i].id
      }
      if (this.links[playlist.id] !== undefined) {
        playlist.rfid = this.links[this.playlists[i].id]
      }
      this.list.push(playlist)
    }
  },
  computed: {}
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.header-img {
  margin-top: 5%;
  height: 15vh;
}

#login {
  margin-top: 5%;
}

.has-image-centered {
  margin-left: auto;
  margin-right: auto;
}

#edit-icon {
  float: right;
}

#edit-icon:hover {
  cursor: pointer;
}

.delete-tag:hover {
  cursor: pointer;
}
</style>
