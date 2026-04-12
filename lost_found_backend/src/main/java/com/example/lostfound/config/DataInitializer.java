package com.example.lostfound.config;

import com.example.lostfound.entity.Item;
import com.example.lostfound.entity.Notice;
import com.example.lostfound.entity.User;
import com.example.lostfound.repository.ItemRepository;
import com.example.lostfound.repository.NoticeRepository;
import com.example.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Override
    public void run(String... args) {
        // 创建管理员账号
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setRealName("系统管理员");
            admin.setCollege("信息中心");
            admin.setPhoneNumber("13800000000");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("=== 管理员账号: admin / admin123 ===");
        }

        // 创建普通用户
        if (!userRepository.existsByUsername("2024001")) {
            User user1 = new User();
            user1.setUsername("2024001");
            user1.setPassword("123456");
            user1.setRealName("张三");
            user1.setCollege("计算机学院");
            user1.setPhoneNumber("13800138001");
            userRepository.save(user1);

            User user2 = new User();
            user2.setUsername("2024002");
            user2.setPassword("123456");
            user2.setRealName("李四");
            user2.setCollege("软件学院");
            user2.setPhoneNumber("13800138002");
            userRepository.save(user2);
        }

        // 初始化公告
        if (noticeRepository.count() == 0) {
            Notice n1 = new Notice();
            n1.setTitle("欢迎使用失物招领系统");
            n1.setContent("本平台致力于帮助师生快速找回丢失物品。如有疑问请联系管理员。");
            noticeRepository.save(n1);

            Notice n2 = new Notice();
            n2.setTitle("失物存放地点变更通知");
            n2.setContent("即日起，图书馆捡到的物品统一存放在图书馆前台，请失主携带有效证件前往认领。");
            noticeRepository.save(n2);
            System.out.println("=== 公告数据已初始化 ===");
        }

        // 初始化物品数据
        if (itemRepository.count() == 0) {
            User admin = userRepository.findFirstByUsername("admin").orElse(null);
            Long adminId = admin != null ? admin.getId() : null;

            // 有图片的失物招领
            itemRepository.save(createItem("黑色钱包", "在图书馆门口捡到，里面有身份证和几张银行卡", "FOUND",
                "图书馆正门", "13800138000", LocalDateTime.now().minusDays(1), false, "图书馆前台", "钱包",
                "https://picsum.photos/seed/wallet/400/300", adminId));

            itemRepository.save(createItem("蓝色双肩包", "教学楼A栋三楼走廊遗失，里面有笔记本电脑", "LOST",
                "教学楼A栋三楼", "13900139000", LocalDateTime.now().minusDays(2), false, null, "背包",
                "https://picsum.photos/seed/backpack/400/300", adminId));

            itemRepository.save(createItem("白色蓝牙耳机", "食堂二楼靠窗位置捡到，AirPods Pro", "FOUND",
                "食堂二楼", "13700137000", LocalDateTime.now().minusHours(5), true, "食堂二楼失物招领处", "电子设备",
                "https://picsum.photos/seed/airpods/400/300", adminId));

            itemRepository.save(createItem("粉色星星发卡", "女生宿舍楼下丢失，银色蝴蝶结样式，带小钻", "LOST",
                "女生宿舍楼下", "13600136000", LocalDateTime.now().minusHours(12), false, null, "饰品",
                "https://picsum.photos/seed/hairclip/400/300", adminId));

            itemRepository.save(createItem("银色手表", "操场看台附近捡到，Swatch品牌", "FOUND",
                "操场看台", "13500135000", LocalDateTime.now().minusDays(3), false, "体育学院办公室", "饰品",
                "https://picsum.photos/seed/watch/400/300", adminId));

            itemRepository.save(createItem("校园卡", "食堂一楼门口捡到，卡上姓王", "FOUND",
                "食堂一楼", "13400134000", LocalDateTime.now().minusHours(8), false, "食堂一楼服务台", "证件",
                "https://picsum.photos/seed/card/400/300", adminId));

            // 无图片的物品
            itemRepository.save(createItem("黑色雨伞", "自习室门口丢失，左侧有贴纸标记", "LOST",
                "自习室门口", "13300133000", LocalDateTime.now().minusDays(1), false, null, "其他", null, adminId));

            itemRepository.save(createItem("笔记本电脑充电器", "图书馆五楼捡到，ThinkPad原装", "FOUND",
                "图书馆五楼", "13200132000", LocalDateTime.now().minusDays(4), true, "图书馆前台", "电子设备",
                "https://picsum.photos/seed/charger/400/300", adminId));

            itemRepository.save(createItem("黑色眼镜盒", "教学楼B栋201教室丢失，里面有墨镜", "LOST",
                "教学楼B栋201", "13100131000", LocalDateTime.now().minusHours(20), false, null, "其他",
                "https://picsum.photos/seed/glasses/400/300", adminId));

            itemRepository.save(createItem("钥匙串", "宿舍楼门口捡到，上面有3把钥匙和小熊挂件", "FOUND",
                "宿舍楼门口", "13000130000", LocalDateTime.now().minusHours(3), false, "宿舍楼管理员处", "其他", null, adminId));

            itemRepository.save(createItem("白色水杯", "体育馆内丢失，杯身有Nike标志", "LOST",
                "体育馆", "12900129000", LocalDateTime.now().minusDays(2), false, null, "文具",
                "https://picsum.photos/seed/cup/400/300", adminId));

            itemRepository.save(createItem("黑色单肩包", "食堂三楼捡到，里面有书本和文具", "FOUND",
                "食堂三楼", "12800128000", LocalDateTime.now().minusDays(1), false, "食堂三楼办公室", "背包", null, adminId));

            itemRepository.save(createItem("银色项链", "图书馆二楼阅览室丢失，细链子带吊坠", "LOST",
                "图书馆二楼", "12700127000", LocalDateTime.now().minusHours(6), false, null, "饰品",
                "https://picsum.photos/seed/necklace/400/300", adminId));

            System.out.println("=== 13条测试数据已初始化（部分含图片）===");
        }
    }

    private Item createItem(String name, String desc, String type, String location,
                           String contact, LocalDateTime foundTime, boolean resolved, String storage, String category, String images, Long userId) {
        Item item = new Item();
        item.setName(name);
        item.setDescription(desc);
        item.setType(Item.ItemType.valueOf(type));
        item.setLocation(location);
        item.setContactInfo(contact);
        item.setFoundTime(foundTime);
        item.setIsResolved(resolved);
        if (storage != null) item.setStorageLocation(storage);
        item.setCategory(category);
        if (images != null) item.setImages(images);
        if (userId != null) item.setUserId(userId);
        return item;
    }
}
