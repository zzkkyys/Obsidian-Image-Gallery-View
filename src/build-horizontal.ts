const buildHorizontal = (
  container: HTMLElement,
  imagesList: {[key: string]: any},
  settings: {[key: string]: any}
) => {
  // inject the gallery wrapper
  const gallery = container.createEl('div')
  gallery.addClass('grid-wrapper')
  gallery.style.display = 'flex'
  gallery.style.flexWrap = 'wrap'
  gallery.style.marginRight = `-${settings.gutter}px`

  // inject and style images
  imagesList.forEach((file: {[key: string]: string}) => {
    // 创建一个图片和名称的包装容器
    const wrapper = gallery.createEl('div')
    wrapper.addClass('image-wrapper')
    wrapper.style.margin = `0px ${settings.gutter}px ${settings.gutter}px 0px`
    wrapper.style.width = 'auto'
    wrapper.style.display = 'flex'
    wrapper.style.flexDirection = 'column' // 垂直排列图片和名称
    wrapper.style.flex = '1 0 auto'

    const figure = wrapper.createEl('figure')
    figure.addClass('grid-item')
    figure.style.margin = '0'
    figure.style.width = 'auto'
    figure.style.height = `${settings.height}px`
    figure.style.borderRadius = `${settings.radius}px`
    figure.style.flex = '1 0 auto'
    figure.style.overflow = 'hidden'
    figure.style.cursor = 'pointer'
    figure.setAttribute('data-name', file.name)
    figure.setAttribute('data-folder', file.folder)
    // 确保正确设置data-src属性
    figure.setAttribute('data-src', file.uri)
    // 添加子标题数据
    figure.setAttribute('data-sub-html', `<h4>${file.name}</h4>`)

    const img = figure.createEl('img')
    img.style.objectFit = 'cover'
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.borderRadius = '0px'
    img.loading = 'lazy'
    img.decoding = 'async'
    img.src = file.uri
    
    if (settings.border) {
      img.style.border = `${settings.borderWidth}px ${settings.borderType} ${settings.borderColor}`
      img.style.boxSizing = 'border-box'
    }
    
    // 添加图片名称 - 单行显示并悬停显示全称
    if (settings.showName) {
      // 将名称放在图片下方
      const nameEl = wrapper.createEl('div')
      nameEl.addClass('img-name')
      nameEl.textContent = file.name
      nameEl.title = file.name // 添加title属性以在悬停时显示全名
      
      // 样式设置
      nameEl.style.display = 'block'
      nameEl.style.textAlign = 'center'
      nameEl.style.padding = '2px'
      nameEl.style.fontSize = '0.85rem'
      nameEl.style.lineHeight = '1.2'
      nameEl.style.color = 'var(--text-normal)'
      nameEl.style.backgroundColor = 'var(--background-secondary)'
      nameEl.style.width = '100%'
      nameEl.style.boxSizing = 'border-box'
      
      // 单行文本设置
      nameEl.style.whiteSpace = 'nowrap'
      nameEl.style.overflow = 'hidden'
      nameEl.style.textOverflow = 'ellipsis'
    }
  })

  return gallery
}

export default buildHorizontal