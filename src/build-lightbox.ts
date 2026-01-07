import { App, Platform, TFile } from 'obsidian'
import Lightbox from 'lightgallery';
import LightboxThumbs from 'lightgallery/plugins/thumbnail'

const lightbox = (gallery: HTMLElement, imagesList: {[key: string]: any}, app: App) => {
  const decodedUris = new Set<string>()
  const inflightUris = new Set<string>()

  const warmDecode = (uri: string | undefined) => {
    if (!uri) return
    if (decodedUris.has(uri) || inflightUris.has(uri)) return

    inflightUris.add(uri)
    const img = new Image()
    img.decoding = 'async'
    img.src = uri

    const maybeDecode = (img as any).decode
    const decodePromise: Promise<unknown> =
      typeof maybeDecode === 'function' ? (img as any).decode() : Promise.resolve()

    decodePromise
      .catch(() => undefined)
      .finally(() => {
        inflightUris.delete(uri)
        decodedUris.add(uri)
      })
  }

  const scheduleWarmDecode = (uris: Array<string | undefined>) => {
    const run = () => {
      for (const uri of uris) warmDecode(uri)
    }

    const ric = (window as any).requestIdleCallback
    if (typeof ric === 'function') ric(run, { timeout: 800 })
    else window.setTimeout(run, 0)
  }

  const neighborUris = (index: number, radius = 2) => {
    const uris: Array<string | undefined> = []
    for (let offset = -radius; offset <= radius; offset++) {
      if (offset === 0) continue
      const candidate = imagesList[index + offset]
      uris.push(candidate?.uri)
    }
    return uris
  }

  // 确保图片元素有正确的属性设置
  const items = gallery.querySelectorAll('.grid-item');
  items.forEach((item, index) => {
    const file = imagesList[index];
    if (file) {
      // 确保data-src属性设置正确
      item.setAttribute('data-src', file.uri);
      
      // 添加子标题数据属性用于显示图片名称
      if (file.name) {
        item.setAttribute('data-sub-html', `<h4>${file.name}</h4>`);
      }
    }
  });

  // 附加自定义按钮打开原始图片，仅桌面版
  if (Platform.isDesktop) globalSearchBtn(gallery, imagesList, app);

  // 设置lightbox参数
  const galleryLightbox = Lightbox(gallery, {
    plugins: [LightboxThumbs],
    counter: false,
    download: false,
    thumbnail: true,
    preload: 3,
    loop: true,
    mode: 'lg-fade',
    selector: '.grid-item', // 明确指定选择器
    addClass: 'igv-lightbox',
    licenseKey: '622E672F-760D49DC-980EF90F-B7A9DCB0',
    speed: 500,
    backdropDuration: 400,
    // 启用子标题
    subHtmlSelectorRelative: true, 
    appendSubHtmlTo: '.lg-item'
  });

  // 预热解码相邻图片，减少左右切换卡顿（尤其是大图）
  gallery.addEventListener('lgAfterOpen', (event: any) => {
    const index = event?.detail?.index ?? 0
    scheduleWarmDecode(neighborUris(index, 2))
  })

  gallery.addEventListener('lgAfterSlide', (event: any) => {
    const index = event?.detail?.index
    if (typeof index === 'number') scheduleWarmDecode(neighborUris(index, 2))
  })

  // 移动设备上，确保移除不必要的控件
  if (Platform.isIosApp || Platform.isAndroidApp) {
    const elements: NodeListOf<HTMLElement> = document.querySelectorAll('.lg-close, .lg-prev, .lg-next');
    for (const element of elements) {
      element.style.display = 'none';
    }
  }

  return galleryLightbox;
}

const normalizeVaultPath = (folder: string | undefined, name: string) => {
  const safeFolder = (folder ?? '').trim()

  if (!safeFolder || safeFolder === '/') return name
  return `${safeFolder.replace(/\/$/, '')}/${name}`
}

const openImageFile = (app: App, selected: { folder?: string; name: string }) => {
  const filePath = normalizeVaultPath(selected.folder, selected.name)
  const abstract = app.vault.getAbstractFileByPath(filePath)

  if (!(abstract instanceof TFile)) {
    // 不抛错，避免打断 lightbox；在控制台给出线索即可
    console.warn('[Obsidian-Image-Gallery-View] Image file not found:', filePath)
    return
  }

  const leaf = app.workspace.getLeaf(true)
  // openFile 会在找不到内容时显示 Obsidian 的 “Failed to load content”
  // 这里提前校验 TFile，尽量避免触发该错误页
  leaf.openFile(abstract, { active: true })
}

const globalSearchBtn = (gallery: HTMLElement, imagesList: {[key: string]: any}, app: App) => {
  gallery.addEventListener('lgInit', (event: CustomEvent) => {
    const galleryInstance = event.detail.instance;
    const btn ='<button type="button" id="btn-glob-search" class="lg-icon btn-glob-search"></button>';
    galleryInstance.outer.find('.lg-toolbar').append(btn);

    galleryInstance.outer.find('#btn-glob-search').on('click', () => {
      const index = galleryInstance.index;
      const selected = imagesList[index];
      if (selected?.name) openImageFile(app, selected);
      galleryInstance.closeGallery();
    });
  });
}

export default lightbox;