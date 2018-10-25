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
      div#last-tag(
        v-if="lastTag.length > 0"
        )
        section.section
          h4.is-size-4 Last Unkown Tag:
          p {{ lastTag }}
          button.button.is-rounded.is-primary(
            @click="isAssigning = true"
            )
            p(v-if="!isAssigning") Assign
            p(v-else) Click a playlist to assign the tag to
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
              v-for="item in list",
              @click="assign(item.id)"
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
import { getPlaylists, getLinks, removeLink, createLink } from './api'

export default {
  name: 'App',
  components: {},
  methods: {
    /**
     * Fetch the user's playlists
     * @return {[type]} [description]
     */
    fillPlaylists: async function () {
      let playlists = []
      try {
        playlists = await getPlaylists()
        this.playlists = playlists
      } catch (e) {
        console.error(e)
      }
    },
    /**
     * Fetch the user's links
     * @return {[type]} [description]
     */
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
    /**
     * Toggle editing state
     * @return {[type]} [description]
     */
    toggleEditing: function () {
      this.isEditing = !this.isEditing
    },
    /**
     * Delete a link
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    deleteTag: async function (id) {
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) {
          await removeLink(this.list[i].rfid)
          this.list[i].rfid = ''
        }
      }
    },
    /**
     * Assign a tag to a playlist
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    assign: async function (id) {
      if (!this.isAssigning) return

      try {
        await createLink(this.lastTag, id)
      } catch (e) {
        console.alert(e.message)
      }

      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].id === id) {
          this.list[i].rfid = this.lastTag
        }
      }

      this.isAssigning = false
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
      list: [],
      socket: {},
      lastTag: '',
      isAssigning: false
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
  created: function () {
    this.socket = new WebSocket('ws://localhost:8888/ws')

    this.socket.addEventListener('message', (event) => {
      this.lastTag = event.data
      console.log('data', event.data)
    })
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
